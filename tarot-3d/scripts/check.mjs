import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { TAROT_CARDS } from '../src/data/cards.js';
import { DOMAINS } from '../src/data/domains.js';
import { altarNodePose, NODE_VISUALS } from '../src/scene/Altar.js';
import {
  advanceFanInertia,
  drawStageSpreadPose,
  FAN_INERTIA_STOP_VELOCITY,
  fanLayerPose,
  getLayoutProfile,
  normalizeDrawOffset,
  replaceDrawPoolCard,
  readingExtractionPose,
  readingRetreatPose,
  readingSafePlaneZ,
  readingPose,
  resultSpreadPose,
  revealPose,
  rotateDrawPool
} from '../src/scene/TarotScene.js';
import { TarotState } from '../src/state/tarot-state.js';
import { pause, tween } from '../src/animation/tween.js';

assert.equal(TAROT_CARDS.length, 78, 'Expected all 78 tarot cards');
assert.equal(new Set(TAROT_CARDS.map((card) => card.id)).size, 78, 'Card ids must be unique');
assert.equal(DOMAINS.length, 8, 'Expected eight reading domains');
assert.ok(TAROT_CARDS.every((card) => card.readings.length === 8), 'Every card needs eight readings');
const tendencyValues = new Set(['顺势', '平稳', '留意']);
const hasReadingFields = (reading) => reading
  && [reading.theme, reading.caution, reading.advice].every((value) => typeof value === 'string' && value.trim())
  && tendencyValues.has(reading.tendency)
  && Number.isInteger(reading.intensity)
  && reading.intensity >= 1
  && reading.intensity <= 5;
assert.ok(TAROT_CARDS.every((card) => card.readings.every((reading) => hasReadingFields(reading) && hasReadingFields(reading.reversed))), 'Every reading needs complete upright and reversed content');

const readingVersions = (reading) => [reading, reading.reversed];
const chineseLength = (value) => [...value].filter((character) => /[\u4e00-\u9fff]/.test(character)).length;
const compactOpening = (value) => value.replace(/[，。；、\s]/g, '');
const sharesLongOpening = (left, right) => {
  const a = compactOpening(left);
  const b = compactOpening(right);
  let length = 0;
  while (length < a.length && length < b.length && a[length] === b[length]) length += 1;
  return length >= 8;
};
const domainPrefix = /^(?:在近期整体|在身心状态|在金钱财务|在工作事业|在出行安排|在家庭生活|在人际关系|在恋爱感情)上[，。]/;
const healthSafety = {
  'major-13-death': /现实死亡预示|身体预示/,
  'major-15-devil': /成瘾诊断|习惯怎样影响生活/,
  'major-16-tower': /疾病、事故或灾难预示|现实中的压力/,
  'major-18-moon': /牌面判断身体状况|担忧当成诊断/
};
for (const card of TAROT_CARDS) {
  for (const [domainIndex, reading] of card.readings.entries()) {
    for (const version of readingVersions(reading)) {
      assert.doesNotMatch(version.theme, domainPrefix, `${card.name} theme must not repeat the domain label`);
      assert.doesNotMatch(version.caution, domainPrefix, `${card.name} caution must not repeat the domain label`);
      assert.doesNotMatch(version.advice, domainPrefix, `${card.name} advice must not repeat the domain label`);
      assert.ok(chineseLength(version.theme) <= 40, `${card.name} theme should remain concise`);
      assert.ok(chineseLength(version.caution) <= 40, `${card.name} caution should remain concise`);
      assert.ok(chineseLength(version.advice) <= (domainIndex === 1 ? 52 : 34), `${card.name} advice should remain concise`);
      if (domainIndex === 1 && healthSafety[card.id]) {
        assert.match(version.advice, healthSafety[card.id], `${card.name} health advice must keep its safety framing`);
      }
      const fields = [version.theme, version.caution, version.advice];
      for (let first = 0; first < fields.length; first += 1) {
        for (let second = first + 1; second < fields.length; second += 1) {
          assert.ok(!sharesLongOpening(fields[first], fields[second]), `${card.name} reading sections must not repeat a long opening`);
        }
      }
    }
  }
}

const uprightAdvice = TAROT_CARDS.flatMap((card) => card.readings.map((reading) => reading.advice));
const reversedAdvice = TAROT_CARDS.flatMap((card) => card.readings.map((reading) => reading.reversed.advice));
const healthAdvice = TAROT_CARDS.flatMap((card) => [card.readings[1].advice, card.readings[1].reversed.advice]);
assert.ok(new Set(uprightAdvice).size >= 500, 'Upright advice must retain substantial card and domain diversity');
assert.ok(new Set(reversedAdvice).size >= 500, 'Reversed advice must retain substantial card and domain diversity');
assert.ok(healthAdvice.filter((value) => /医生|专业人士|专业帮助|专业支持|按现实症状求助/.test(value)).length < healthAdvice.length / 2, 'Health guidance should not add professional-care wording to every card');
for (const card of TAROT_CARDS) {
  assert.ok(new Set(card.readings.map((reading) => reading.advice)).size >= 6, `${card.name} needs at least six distinct upright advices`);
  assert.ok(new Set(card.readings.map((reading) => reading.reversed.advice)).size >= 6, `${card.name} needs at least six distinct reversed advices`);
  for (const field of ['theme', 'caution']) {
    assert.ok(new Set(card.readings.map((reading) => reading[field])).size >= 6, `${card.name} needs at least six distinct upright ${field}s`);
    assert.ok(new Set(card.readings.map((reading) => reading.reversed[field])).size >= 6, `${card.name} needs at least six distinct reversed ${field}s`);
  }
}
for (let domainIndex = 0; domainIndex < DOMAINS.length; domainIndex += 1) {
  const advice = TAROT_CARDS.map((card) => card.readings[domainIndex].reversed.advice);
  assert.ok(new Set(advice).size >= 60, `${DOMAINS[domainIndex].name} needs card-specific reversed advice`);
}
const advicePairs = TAROT_CARDS.flatMap((card) => card.readings);
assert.ok(advicePairs.filter((reading) => reading.advice !== reading.reversed.advice).length / advicePairs.length >= 0.8, 'Most upright and reversed advice must differ');

const cardsDataSource = readFileSync(resolve('src/data/cards.js'), 'utf8');
const uiSource = readFileSync(resolve('src/ui/ui.js'), 'utf8');
const styleSource = readFileSync(resolve('src/ui/style.css'), 'utf8');
const indexHtml = readFileSync(resolve('index.html'), 'utf8');
assert.match(cardsDataSource, /^export const TAROT_CARDS = \[/, 'Reading copy must remain literal TAROT_CARDS data');
assert.doesNotMatch(cardsDataSource, /DOMAIN_COPY|UPRIGHT_THEMES|REVERSED_THEMES|CAUTIONS|PLAIN_REPLACEMENTS|plainText|sentence\(|TAROT_CARDS\.forEach/, 'Reading copy must be stored directly in TAROT_CARDS');
for (const phrase of ['眼前重点正在浮现', '作息和精力值得照顾', '收入、支出要看清', '任务与合作要理顺', '时间和路线要核对', '需要和分工要说开', '想法与界线要说清', '感受和期待要确认', '眼前重点还没理清', '金额和条件还没定', '任务和期限还没对齐', '时间和路线还没定下', '需要和分工还没说开', '彼此想法还没对上', '感受和期待还不清楚', '先别急着替眼前的事下结论', '先把休息和吃饭都放在前面', '先把金额、条件和期限看清再决定', '先把任务、责任和期限都对齐', '先核对时间、路线和备用安排', '先把真正需要和分工说开再决定', '先问清彼此到底在想什么再回应', '先把感受、期待和界线说清再决定']) {
  assert.ok(!cardsDataSource.includes(phrase), `Reading copy must not retain the global template: ${phrase}`);
}
const clauses = new Map();
for (const card of TAROT_CARDS) {
  for (const reading of card.readings) {
    for (const version of readingVersions(reading)) {
      for (const value of [version.theme, version.caution, version.advice]) {
        for (const clause of value.split(/[。；！？]/).map((part) => part.replace(/[，、\s]/g, ''))) {
          if (chineseLength(clause) >= 6) clauses.set(clause, (clauses.get(clause) ?? 0) + 1);
        }
      }
    }
  }
}
for (const [clause, count] of clauses) {
  assert.ok(count <= 8, `Reading clause repeats too often (${count}): ${clause}`);
}
assert.deepEqual([...uiSource.matchAll(/<h3>([^<]+)<\/h3>/g)].map((match) => match[1]), ['此刻', '留意', '下一步'], 'Reading headings must stay concise and ordered');
for (const heading of ['此刻的讯息', '值得留意', '给你的小提示']) {
  assert.ok(!uiSource.includes(heading), `Reading UI must not use ${heading}`);
}
for (const phrase of ['可掌握的范围', '资源分散', '行动承诺', '推进节奏', '对应的阻力', '共同规范', '交换与边界', '可持续的恢复安排', '求证', '悬置', '耗损', '脆弱环节', '检视', '可交付范围', '依可靠信息行动', '复查节点', '自主选择', '风险可控', '试错金额', '返程方式', '沉没成本', '反位']) {
  assert.ok(!cardsDataSource.includes(phrase), `Plain-language copy must not contain ${phrase}`);
}

const cardsDir = resolve('public/cards');
const assets = new Set(readdirSync(cardsDir).filter((file) => file.endsWith('.webp')).map((file) => file.slice(0, -5)));
assert.ok(existsSync(resolve('public/card-back.png')), 'Missing card-back asset');
assert.ok(TAROT_CARDS.every((card) => assets.has(card.id)), 'Every tarot card needs a matching WebP asset');
for (const asset of ['altar-main.png', 'altar-node.png', 'altar-glint.png', 'altar-crescent.png']) {
  assert.ok(existsSync(resolve('public/altar', asset)), `Missing altar asset: ${asset}`);
}

const uniqueHtmlValue = (pattern, label) => {
  const matches = [...indexHtml.matchAll(pattern)];
  assert.equal(matches.length, 1, `${label} must appear exactly once`);
  return matches[0][1];
};
const productTitle = '月间 · 3D 塔罗圣坛';
const productDescription = '抽取八张塔罗牌，从八个角度安静地看看最近的生活。';
const productionUrl = 'https://moonlit-tarot-3d-preview.netlify.app/';
const socialImageUrl = `${productionUrl}social-preview.png`;
assert.equal(uniqueHtmlValue(/<title>([^<]+)<\/title>/g, 'Title'), productTitle);
assert.equal(uniqueHtmlValue(/<meta name="description" content="([^"]+)"\s*\/>/g, 'Description'), productDescription);
assert.equal(uniqueHtmlValue(/<meta name="theme-color" content="([^"]+)"\s*\/>/g, 'Theme color'), '#120d1b');
assert.equal(uniqueHtmlValue(/<link rel="canonical" href="([^"]+)"\s*\/>/g, 'Canonical URL'), productionUrl);
assert.equal(uniqueHtmlValue(/<meta property="og:title" content="([^"]+)"\s*\/>/g, 'Open Graph title'), productTitle);
assert.equal(uniqueHtmlValue(/<meta property="og:description" content="([^"]+)"\s*\/>/g, 'Open Graph description'), productDescription);
assert.equal(uniqueHtmlValue(/<meta property="og:type" content="([^"]+)"\s*\/>/g, 'Open Graph type'), 'website');
assert.equal(uniqueHtmlValue(/<meta property="og:url" content="([^"]+)"\s*\/>/g, 'Open Graph URL'), productionUrl);
assert.equal(uniqueHtmlValue(/<meta property="og:image" content="([^"]+)"\s*\/>/g, 'Open Graph image'), socialImageUrl);
assert.ok(uniqueHtmlValue(/<meta property="og:image:alt" content="([^"]+)"\s*\/>/g, 'Open Graph image alt'));
assert.equal(uniqueHtmlValue(/<meta name="twitter:card" content="([^"]+)"\s*\/>/g, 'Twitter card'), 'summary_large_image');
assert.equal(uniqueHtmlValue(/<meta name="twitter:title" content="([^"]+)"\s*\/>/g, 'Twitter title'), productTitle);
assert.equal(uniqueHtmlValue(/<meta name="twitter:description" content="([^"]+)"\s*\/>/g, 'Twitter description'), productDescription);
assert.equal(uniqueHtmlValue(/<meta name="twitter:image" content="([^"]+)"\s*\/>/g, 'Twitter image'), socialImageUrl);
assert.equal(uniqueHtmlValue(/<link rel="icon" type="image\/png" sizes="32x32" href="([^"]+)"\s*\/>/g, 'Favicon'), '/favicon.png');
assert.equal(uniqueHtmlValue(/<link rel="apple-touch-icon" sizes="180x180" href="([^"]+)"\s*\/>/g, 'Apple Touch Icon'), '/apple-touch-icon.png');
assert.equal(uniqueHtmlValue(/<meta name="apple-mobile-web-app-title" content="([^"]+)"\s*\/>/g, 'Apple web app title'), '月间');

const pngDimensions = (path) => {
  const png = readFileSync(path);
  assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), `Invalid PNG: ${path}`);
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
};
for (const asset of ['social-preview.png', 'favicon.png', 'apple-touch-icon.png']) {
  assert.ok(existsSync(resolve('public', asset)), `Missing public metadata asset: ${asset}`);
}
assert.deepEqual(pngDimensions(resolve('public/social-preview.png')), [1200, 630], 'Social preview must be 1200×630');
assert.deepEqual(pngDimensions(resolve('public/favicon.png')), [32, 32], 'Favicon must be 32×32');
assert.deepEqual(pngDimensions(resolve('public/apple-touch-icon.png')), [180, 180], 'Apple Touch Icon must be 180×180');

const layouts = [
  [390, 844, 'standard-mobile'],
  [375, 667, 'compact'],
  [430, 932, 'standard-mobile'],
  [1024, 768, 'desktop']
].map(([width, height, name]) => {
  const layout = getLayoutProfile(width, height);
  assert.equal(layout.name, name, `Expected ${name} layout at ${width}x${height}`);
  for (const key of ['fanY', 'fanStepX', 'fanLayerStep', 'revealY', 'revealZ', 'revealScale', 'stagingTopY', 'stagingBottomY', 'stagingStepX', 'stagingScale', 'resultRadiusX', 'resultRadiusY', 'nodeDrawRadiusX', 'nodeDrawRadiusY', 'nodeDrawCenterY', 'nodeOutsetVertical', 'nodeOutsetDiagonal', 'nodeOutsetHorizontal', 'nodeScale', 'resultBaseZ', 'resultDepth', 'resultCameraZ', 'resultTargetY', 'readingTargetY', 'readingCameraZ', 'readingFov', 'readingRetreatZ', 'readingRetreatScale', 'readingSafePlaneGap', 'readingY', 'readingZ', 'readingScale']) {
    assert.ok(Number.isFinite(layout[key]), `${name} layout needs ${key}`);
  }
  return layout;
});

const mobileLayout = layouts[0];
const compactLayout = layouts[1];
const wideMobileLayout = layouts[2];
const drawTop = drawStageSpreadPose(0, mobileLayout);
const drawBottom = drawStageSpreadPose(4, mobileLayout);
const resultTop = resultSpreadPose(0, mobileLayout);
const reveal = revealPose(mobileLayout);
const readingForeground = readingPose(mobileLayout);
assert.ok(drawTop.position.y > drawBottom.position.y, 'The staging top row must sit above its bottom row');
assert.ok(resultTop.position.y > 0, 'Domain one must visually sit at the top of the final spread');
assert.notDeepEqual(drawTop.position, resultTop.position, 'Staging and result spreads need separate poses');
assert.ok(reveal.position.y < drawBottom.position.y && reveal.position.z > drawBottom.position.z, 'Reveal must sit in front of and below the staging layout');
assert.ok(readingForeground.position.z > resultTop.position.z, 'Reading card must move toward the foreground');
assert.notDeepEqual(readingPose(compactLayout).position, readingPose(wideMobileLayout).position, 'Reading card pose must adapt between mobile layouts');
assert.ok(compactLayout.readingScale >= 1.25 && mobileLayout.readingScale >= 1.4, 'Mobile reading cards must fill the upper visual zone');
assert.ok(mobileLayout.readingCameraZ < mobileLayout.resultCameraZ && compactLayout.readingCameraZ < compactLayout.resultCameraZ, 'Mobile Reading must move the camera closer to the selected card');
assert.ok(compactLayout.revealScale > 1 && mobileLayout.revealScale > 1.1, 'Mobile reveal cards must be large enough to appreciate');
assert.ok(compactLayout.stagingScale > 0.38 && mobileLayout.stagingScale > 0.42, 'Mobile staging cards must remain appreciable');
assert.ok(compactLayout.resultSpreadScale > 0.9 && mobileLayout.resultSpreadScale > 0.95, 'Mobile result cards must be larger than the prior compact layout');
for (const [layout, width, height] of [[compactLayout, 375, 667], [mobileLayout, 390, 844], [wideMobileLayout, 430, 932]]) {
  const viewHeight = 2 * (layout.readingCameraZ - layout.readingZ) * Math.tan(layout.readingFov * Math.PI / 360);
  const cardHeight = layout.readingScale * 1.17 / viewHeight;
  const cardCenter = 0.5 - (layout.readingY - layout.readingTargetY) / viewHeight;
  const cardWidth = 0.78 * layout.readingScale / (viewHeight * width / height);
  assert.ok(cardHeight >= 0.38 && cardHeight < 0.43, `${layout.name} Reading artwork must fill but fit above the sheet`);
  assert.ok(cardCenter - cardHeight / 2 > 0 && cardCenter + cardHeight / 2 < 0.43, `${layout.name} Reading artwork must remain within its upper visual zone`);
  assert.ok(cardWidth < 1, `${layout.name} Reading artwork must fit within the viewport width`);
}
for (const layout of layouts) {
  const anchors = Array.from({ length: 8 }, (_, index) => altarNodePose(index, layout));
  assert.equal(anchors.length, 8, `${layout.name} needs eight altar anchors`);
  assert.equal(new Set(anchors.map(({ x, y }) => `${x}:${y}`)).size, 8, `${layout.name} altar anchors must remain distinct`);
  assert.deepEqual(anchors, Array.from({ length: 8 }, (_, index) => altarNodePose(index, layout)), `${layout.name} altar anchors must be deterministic`);
  assert.ok(anchors[0].y > anchors[4].y && anchors[2].x > anchors[6].x, `${layout.name} altar anchor mapping must remain orbital`);
  const staging = Array.from({ length: 8 }, (_, index) => drawStageSpreadPose(index, layout));
  const lowestStagingEdge = Math.min(...staging.map((item) => item.position.y - item.scale.y * 1.17 / 2));
  const fanTopEdge = layout.fanY + layout.fanCenterLift + layout.fanScale * 1.17 / 2;
  assert.ok(lowestStagingEdge - fanTopEdge > 0.1, `${layout.name} staging cards must remain above the fan`);
  assert.equal(new Set(staging.slice(0, 4).map((item) => item.position.x)).size, 4, `${layout.name} staging top row needs four distinct slots`);
  const result = Array.from({ length: 8 }, (_, index) => resultSpreadPose(index, layout));
  const resultNodes = Array.from({ length: 8 }, (_, index) => altarNodePose(index, layout, 'result'));
  const safePlane = readingSafePlaneZ(layout);
  const maxResultZ = Math.max(...result.map((item) => item.position.z));
  assert.equal(result.length, 8, `${layout.name} needs eight final result slots`);
  assert.ok(resultNodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y)), `${layout.name} result nodes need valid positions`);
  assert.equal(new Set(result.map((item) => `${item.position.x}:${item.position.y}`)).size, 8, `${layout.name} result slots must remain distinct`);
  assert.ok(result.every((item) => item.rotation.y === Math.PI), `${layout.name} result cards must stay frontal-readable`);
  assert.ok(safePlane > maxResultZ, `${layout.name} safe plane must sit in front of every result card`);
  assert.ok(readingPose(layout).position.z >= safePlane, `${layout.name} reading pose must remain in the foreground corridor`);
  result.forEach((item, index) => {
    const receded = readingRetreatPose(item, layout);
    const extraction = readingExtractionPose(item, layout);
    assert.ok(receded.position.z < item.position.z && receded.scale.x < item.scale.x, `${layout.name} background cards must recede during reading`);
    assert.equal(extraction.position.x, item.position.x, `${layout.name} extraction must hold slot X`);
    assert.equal(extraction.position.y, item.position.y, `${layout.name} extraction must hold slot Y`);
    assert.equal(extraction.rotation.z, item.rotation.z, `${layout.name} extraction must freeze slot rotation`);
    assert.equal(extraction.scale.x, item.scale.x, `${layout.name} extraction must freeze slot scale`);
    assert.equal(extraction.position.z, safePlane, `${layout.name} extraction must land on shared safe plane`);
  });
  result.forEach((item, index) => {
    const neighbor = result[(index + 1) % result.length];
    const overlapsInPlane = Math.abs(item.position.x - neighbor.position.x) < 0.39 * (item.scale.x + neighbor.scale.x)
      && Math.abs(item.position.y - neighbor.position.y) < 0.585 * (item.scale.y + neighbor.scale.y);
    if (overlapsInPlane) assert.ok(Math.abs(item.position.z - neighbor.position.z) > 0.09, `${layout.name} overlapping result neighbors need physical depth separation`);
  });
}

for (const [width, height] of [[390, 844], [375, 667], [430, 932], [1024, 768]]) {
  const layout = getLayoutProfile(width, height);
  const aspect = width / height;
  const nodeHalfWidth = 0.13 * layout.nodeScale * 1.05 / 2;
  const nodeHalfHeight = 0.235 * layout.nodeScale * 1.05 / 2;
  const drawDistance = layout.drawCameraZ + 0.6;
  const drawHalfWidth = Math.tan(layout.drawFov * Math.PI / 360) * drawDistance * aspect;
  const drawHalfHeight = Math.tan(layout.drawFov * Math.PI / 360) * drawDistance;
  const drawNodes = Array.from({ length: 8 }, (_, index) => altarNodePose(index, layout, 'draw'));
  assert.ok(drawNodes.every((node) => Math.abs(node.x) + nodeHalfWidth + 0.1 < drawHalfWidth), `${width}x${height} draw nodes need horizontal safe margin`);
  assert.ok(drawNodes.every((node) => Math.abs(node.y) + nodeHalfHeight + 0.1 < drawHalfHeight), `${width}x${height} draw nodes need vertical safe margin`);
  const fanTop = layout.fanY + layout.fanCenterLift + layout.fanScale * 1.17 / 2;
  assert.ok(Math.min(...drawNodes.map((node) => node.y)) - nodeHalfHeight > fanTop, `${width}x${height} draw nodes must clear the card fan`);
  const resultDistance = layout.resultCameraZ + 0.6;
  const resultHalfWidth = Math.tan(layout.resultFov * Math.PI / 360) * resultDistance * aspect;
  const resultNodes = Array.from({ length: 8 }, (_, index) => altarNodePose(index, layout, 'result'));
  assert.ok(resultNodes.every((node) => Math.abs(node.x) + nodeHalfWidth < resultHalfWidth), `${width}x${height} result nodes must remain inside the camera frame`);
}

const visualPool = Array.from({ length: 15 }, (_, index) => index);
for (let step = 0; step < 23; step += 1) rotateDrawPool(visualPool, 1);
assert.equal(visualPool[7], 0, 'Fan must continue past twenty forward steps');
for (let step = 0; step < 23; step += 1) rotateDrawPool(visualPool, -1);
assert.deepEqual(visualPool, Array.from({ length: 15 }, (_, index) => index), 'Fan recycling must return to the same visual order');
for (let step = 0; step < 31; step += 1) rotateDrawPool(visualPool, -1);
assert.equal(visualPool[7], 6, 'Fan must continue past twenty reverse steps');

const longOffset = normalizeDrawOffset(31.3);
assert.equal(longOffset.steps, 31, 'Fan offset must recycle beyond any finite drag limit');
assert.ok(Math.abs(longOffset.offset) < 0.5, 'Recycled fan offset must remain bounded');

const replacementPool = Array.from({ length: 15 }, (_, index) => ({ visual: index }));
const unusedVisuals = Array.from({ length: 9 }, (_, index) => ({ visual: index + 15 }));
for (const selectedIndex of [0, 14, 7, 3, 11, 1, 13, 6]) {
  const selected = replacementPool[selectedIndex];
  const entry = replaceDrawPoolCard(replacementPool, unusedVisuals, selected);
  assert.ok(entry, 'A visible visual card must be removable from the fan');
  assert.equal(replacementPool.length, 15, 'Visual pool must stay at fifteen cards after replacement');
  assert.ok(!replacementPool.includes(selected), 'The selected visual card must leave the fan');
  assert.ok(entry.replacement, 'Each of eight draws needs a visual replacement');
}

let inertiaOffset = 0;
let inertiaVelocity = 24;
let inertiaFrames = 0;
while (Math.abs(inertiaVelocity) >= FAN_INERTIA_STOP_VELOCITY && inertiaFrames < 300) {
  const next = advanceFanInertia(inertiaOffset, inertiaVelocity, 1 / 60);
  const normalized = normalizeDrawOffset(next.offset);
  inertiaOffset = normalized.offset;
  inertiaVelocity = next.velocity;
  inertiaFrames += 1;
}
assert.ok(inertiaFrames < 300, 'Inertia must terminate');
assert.ok(Math.abs(inertiaVelocity) < FAN_INERTIA_STOP_VELOCITY, 'Inertia velocity must decay below the settle threshold');
assert.ok(Math.abs(inertiaOffset) < 0.5, 'Inertia recycling must keep the fan offset bounded');

for (const layout of layouts) {
  for (const drawOffset of [-0.49, -0.25, 0, 0.25, 0.49]) {
    const poses = Array.from({ length: 9 }, (_, index) => fanLayerPose(index - 4 - drawOffset, layout, index - 4));
    for (let index = 0; index < poses.length - 1; index += 1) {
      const first = poses[index];
      const second = poses[index + 1];
      const overlappingHorizontally = Math.abs(first.position.x - second.position.x) < 0.78 * Math.max(first.scale.x, second.scale.x);
      if (overlappingHorizontally) {
        assert.ok(Math.abs(first.position.z - second.position.z) >= 0.065, `${layout.name} fan neighbors need physical depth separation at offset ${drawOffset}`);
      }
    }
  }
  const forwardBefore = fanLayerPose(-0.49, layout, 0).position.z;
  const forwardAfterRecycle = fanLayerPose(-0.5, layout, 0).position.z;
  const backwardBefore = fanLayerPose(0.49, layout, 0).position.z;
  const backwardAfterRecycle = fanLayerPose(0.5, layout, 0).position.z;
  assert.ok(Math.abs(forwardBefore - forwardAfterRecycle) < 0.01, `${layout.name} forward recycle must not pop`);
  assert.ok(Math.abs(backwardBefore - backwardAfterRecycle) < 0.01, `${layout.name} backward recycle must not pop`);
}

const originalWindow = globalThis.window;
globalThis.window = { matchMedia: () => ({ matches: true }) };
let reducedMotionProgress = 0;
await tween(240, (amount) => { reducedMotionProgress = amount; });
assert.equal(reducedMotionProgress, 1, 'Reduced motion must complete the final state without an animation frame');
const reducedMotionPause = await Promise.race([pause(240).then(() => true), new Promise((resolve) => setTimeout(() => resolve(false), 0))]);
assert.equal(reducedMotionPause, true, 'Reduced motion pauses must resolve without waiting for a frame');
if (originalWindow === undefined) delete globalThis.window;
else globalThis.window = originalWindow;

const stateSource = readFileSync(resolve('src/state/tarot-state.js'), 'utf8');
const sceneSource = readFileSync(resolve('src/scene/TarotScene.js'), 'utf8');
const mainSource = readFileSync(resolve('src/main.js'), 'utf8');
const altarSource = readFileSync(resolve('src/scene/Altar.js'), 'utf8');
const cardSource = readFileSync(resolve('src/cards/Card3D.js'), 'utf8');
const deprecatedOrientation = '\u53cd\u4f4d';
assert.ok(!JSON.stringify(TAROT_CARDS).includes(deprecatedOrientation), 'Card readings must use standard reversed terminology');
assert.ok(!uiSource.includes(deprecatedOrientation), 'UI labels and live status must use standard reversed terminology');
assert.equal(uiSource.match(/card\.reversed \? '逆位' : '正位'/g)?.length, 3, 'Reading label, live status, and accessible result controls must use standard terminology');
assert.match(stateSource, /< 0\.35/, 'Reversed probability must remain 35%');
const reversedState = new TarotState(TAROT_CARDS);
reversedState.drawn = [{ ...TAROT_CARDS[0], reversed: true }];
assert.equal(reversedState.readingAt(0), TAROT_CARDS[0].readings[0].reversed, 'Reversed cards must resolve reversed readings');
assert.match(sceneSource, /this\.reading = \{ index, card, slot: copyPose\(card\.group\), others \}/, 'Reading must retain selected and other Card3D source poses');
assert.match(sceneSource, /if \(this\.stage === 'reading' && this\.reading\) \{[\s\S]*this\.reading\.slot = slots\[this\.reading\.index\];[\s\S]*applyPose\(this\.reading\.card\.group, this\.readingPose\(\)\);/, 'Reading resize must update selected card pose and return slot');
assert.match(sceneSource, /const layoutVersion = this\.layoutVersion;[\s\S]*const isCurrentLayout = \(\) => layoutVersion === this\.layoutVersion/, 'Reading transitions must stop stale layout tweens after resize');
assert.match(sceneSource, /await this\.animateFlight\(card, target\);\s*const landingTarget = this\.drawStageSpreadPose\(positionIndex\);\s*await this\.settleCard\(card, landingTarget\)/, 'Draw flight must settle at the latest layout target');
assert.match(sceneSource, /await this\.animateSet\(clearing, 160, 0, easing\.outCubic, isCurrentLayout\);[\s\S]*this\.animateReadingOpenPath/, 'Other cards must clear before selected extraction');
assert.match(sceneSource, /animateReadingOpenPath\(card, this\.reading\.slot, isCurrentLayout\)/, 'Reading open must use the selected Card3D safe extraction path');
assert.match(sceneSource, /animateReadingReturnPath\(card, slot, isCurrentLayout\)/, 'Reading close must use the stored slot safe return path');
assert.match(mainSource, /Promise\.race\(\[opening, pause\(\d+\)\]\)/, 'Reading panel must enter during selected-card movement');
assert.match(mainSource, /await opening;\s*ui\.enableReadingDismiss\(\)/, 'Reading dismiss actions must wait until card transition finishes');
assert.match(mainSource, /Promise\.all\(\[ui\.hideReading\(\), scene\.closeReading\(\)\]\)/, 'Reading panel and card return must close together');
assert.match(uiSource, /reading-dismiss-layer" data-action="close-reading"/, 'Reading needs a dedicated outside-dismiss layer');
assert.match(styleSource, /\.tarot-shell\.is-reading::after\s*\{\s*opacity:\s*0\s*;?\s*\}/, 'Reading must not place a heavy global veil over the selected card');
assert.match(styleSource, /\.tarot-shell\.is-reading\s+\.top-bar\s*\{[^}]*visibility:\s*hidden/, 'Reading must hide the top bar without removing its layout space');
assert.match(uiSource, /event\.key === 'Escape' && readingCanDismiss/, 'Reading Escape close must wait for the open transition');
assert.match(uiSource, /button\.dataset\.action !== 'close-reading' \|\| readingCanDismiss/, 'Reading dismiss buttons must ignore duplicate or premature closes');
assert.match(uiSource, /role="dialog" aria-modal="true"/, 'Reading panel must remain a modal dialog');
assert.match(uiSource, /panels\.results\.inert = inert/, 'Results must become inert while Reading is open');
assert.match(uiSource, /secondary-reset-button/, 'Restart controls must use the shared button treatment');
assert.match(altarSource, /altar-main/, 'Celestial altar needs the supplied main ornament asset');
assert.match(altarSource, /altar-node/, 'Celestial altar needs supplied jewel nodes');
assert.doesNotMatch(altarSource, /makeOrnamentTexture|EllipseCurve/, 'Celestial altar must not retain procedural ornament geometry');
assert.match(altarSource, /NODE_VISUALS/, 'Altar nodes need dormant, active, and filled visual targets');
assert.ok(NODE_VISUALS.filled.opacity > NODE_VISUALS.dormant.opacity && NODE_VISUALS.filled.glow > NODE_VISUALS.dormant.glow, 'Filled altar nodes must remain brighter than dormant nodes');
assert.ok(NODE_VISUALS.active.opacity > NODE_VISUALS.preglow.opacity && NODE_VISUALS.active.glow > NODE_VISUALS.preglow.glow, 'Active altar nodes must brighten after ignition');
assert.match(altarSource, /awakenNode/, 'Altar nodes need an awakening transition');
assert.match(altarSource, /setNodeFrame/, 'Altar nodes need draw and result spatial frames');
assert.match(sceneSource, /this\.altar\.setNodeFrame\?\.\('result', 780\)/, 'Altar nodes must expand with the result transition');
assert.doesNotMatch(altarSource, /setNodePosition|nodeAnchor/, 'Altar node anchors must not follow staging-card positions');
assert.match(sceneSource, /this\.altar\.awakenNode\(positionIndex\)/, 'Node awakening must begin when a card is selected');
assert.match(sceneSource, /this\.altar\.setNodeState\(positionIndex, 'filled'\)/, 'Node must settle after its card lands');
assert.doesNotMatch(sceneSource, /setNodePosition|nodeAnchor/, 'Tarot flow must not reposition nodes from card transforms');
assert.match(sceneSource, /await createAltar\(this\.textures\)/, 'Altar assets must load before the scene starts');
assert.match(altarSource, /setReading/, 'Celestial altar must support a dimmed reading state');
assert.match(altarSource, /if \(frozen\) return;/, 'Celestial altar motion must pause for reduced motion');
assert.match(uiSource, /data-action="draw-current"/, 'Keyboard users need a way to select the center draw card');
assert.doesNotMatch(uiSource, /data-action="(?:previous|next)"|draw-controls|round-button/, 'Draw UI must not show previous/next arrow controls');
assert.match(uiSource, /data-progress[\s\S]*data-deck-count/, 'Deck count must sit with the draw progress header');
assert.match(uiSource, /'★'\.repeat\(reading\.intensity\)\s*\+\s*'☆'\.repeat\(5 - reading\.intensity\)/, 'Reading intensity must render exactly five stars');
assert.match(uiSource, /信息强度 \$\{reading\.intensity\} 星，共五颗/, 'Reading intensity stars need an accessible description');
assert.match(uiSource, /data-result-actions/, 'Keyboard users need controls for each result card');
assert.match(uiSource, /button\.dataset\.action = 'read-result'/, 'Result reading controls must open their matching cards');
assert.match(mainSource, /'draw-current': \(\) => drawCard\(scene\?\.currentDrawCard\(\)\)/, 'Draw selection must use the same guarded draw flow');
assert.match(mainSource, /'read-result': \(index\) => openReading\(Number\(index\)\)/, 'Result controls must use the existing reading flow');
assert.match(mainSource, /第 ' \+ state\.drawn\.length \+ ' 张已落位/, 'Live status must announce settled draws and the next position');
assert.match(uiSource, /event\.key === 'Tab' && !panels\.reading\.hidden/, 'Reading focus must remain inside the modal');
assert.match(uiSource, /reading-copy" tabindex="0"/, 'Reading text must be keyboard-scrollable');
assert.match(uiSource, /readingReturnFocus/, 'Closing a reading must restore focus to its trigger');
assert.match(cardSource, /fog: false/, 'Card fronts must remain clear through the scene haze');
assert.match(sceneSource, /this\.stars\.update\?\.\(now, frozen\)/, 'Dream motes must respect reduced motion');
assert.match(sceneSource, /this\.altar\.setReading\?\.\(true\)/, 'Reading must dim the altar without removing it');

for (let round = 0; round < 100; round += 1) {
  const state = new TarotState(TAROT_CARDS);
  for (let slot = 0; slot < 8; slot += 1) {
    state.draw();
  }
  assert.equal(state.drawn.length, 8);
  assert.equal(state.deck.length, 70);
  assert.equal(new Set(state.drawn.map((card) => card.id)).size, 8, 'A draw may not duplicate cards');
  assert.ok(state.drawn.every((card) => typeof card.reversed === 'boolean'), 'Reversed must be boolean');
  assert.ok(state.drawn.every((_, index) => typeof state.readingAt(index).theme === 'string'), 'Drawn cards must resolve readings');
}

console.log('PASS: 78 cards, 8 domains, standard terminology, keyboard card access, modal focus, altar assets, viewport-fit nodes, outside-dismiss reading, safe extraction and return, result depth separation, unique draws, physical fan depth, inertial recycling, and visual-card replacement are present.');
