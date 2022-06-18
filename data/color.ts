export class Color {
    red: number
    green: number
    blue: number

    private constructor(red: number, green: number, blue: number) {
        this.red = red
        this.green = green
        this.blue = blue
    }

    asHex() {
        return this.red << 16 | this.green << 8 | this.blue
    }

    static fromHex(hex: number) {
        return new Color(
            (hex & 0xff0000) >> 16,
            (hex & 0x00ff00) >> 8,
            (hex & 0x0000ff))
    }

    static fromRgb255(red: number, green: number, blue: number) {
        return new Color(red, green, blue)
    }
}