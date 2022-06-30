import { Color } from "../data/color"

describe("color", () => {
    test("create a color from hex", () => {
        let color = Color.fromHex(0xaabbcc)

        expect(color.red).toBe(0xaa)
        expect(color.green).toBe(0xbb)
        expect(color.blue).toBe(0xcc)
    })

    test("create a color from rgb values", () => {
        let color = Color.fromRgb255(0xaa, 0xbb, 0xcc)

        expect(color.red).toBe(0xaa)
        expect(color.green).toBe(0xbb)
        expect(color.blue).toBe(0xcc)
    })

    test("color to hex", () => {
        let color = Color.fromRgb255(0xaa, 0xbb, 0xcc)

        // casted to a string to make result easier to read
        expect(color.asHex().toString(16)).toBe("aabbcc")
    })
})