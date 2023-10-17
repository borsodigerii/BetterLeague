export default interface Skin{
    championId: number,
    chromaPath: string,
    disabled: boolean,
    id: number,
    isBase: boolean,
    lastSelected: boolean,
    name: string,
    ownership: {
      freeToPlayReward: boolean,
      owned: boolean,
      rental: {
        endDate: number,
        purchaseDate: number,
        rented: boolean,
        winCountRemaining: number
      }
    },
    splashPath: string,
    stillObtainable: boolean,
    tilePath: string
}