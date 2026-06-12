import {z} from "zod"

export const sayHiValidation=z.strictObject({
    name:z.string().min(3)
})