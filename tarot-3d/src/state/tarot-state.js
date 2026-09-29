const randomUint = () => {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0];
};

const secureIndex = (length) => {
  const limit = Math.floor(0x100000000 / length) * length;
  let value = randomUint();
  while (value >= limit) value = randomUint();
  return value % length;
};

export class TarotState {
  constructor(cards) {
    this.cards = cards;
    this.reset();
  }

  reset() {
    this.deck = [...this.cards];
    this.drawn = [];
  }

  draw() {
    if (this.drawn.length >= 8) throw new Error('本轮已经抽满八张牌');
    const card = this.deck.splice(secureIndex(this.deck.length), 1)[0];
    const reversed = randomUint() / 0x100000000 < 0.35;
    const result = { ...card, reversed };
    this.drawn.push(result);
    return result;
  }

  readingAt(index) {
    const card = this.drawn[index];
    if (!card) throw new Error('没有这张已抽取的牌');
    return card.reversed ? card.readings[index].reversed : card.readings[index];
  }
}
