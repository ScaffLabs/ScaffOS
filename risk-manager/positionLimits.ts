export class PositionLimits {
  private limits: Map<string, number>;

  constructor() {
    this.limits = new Map();
  }

  setLimit(asset: string, limit: number) {
    this.limits.set(asset, limit);
  }

  checkLimit(asset: string, position: number): boolean {
    const limit = this.limits.get(asset);
    return limit !== undefined ? position <= limit : true;
  }
}