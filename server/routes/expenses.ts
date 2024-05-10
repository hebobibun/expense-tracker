import { Hono } from "hono"
import { zValidator } from '@hono/zod-validator'
import { z } from "zod"

const  expenseSchema = z.object({
    id: z.number().int().positive().min(1),
    title: z.string().min(3).max(50),
    amount: z.number().int().positive()
})

type Expense = z.infer<typeof expenseSchema>

const createPostSchema = expenseSchema.omit({id: true})

const fakeExpenses: Expense[] = [
    { id: 1, title: "groceries", amount: 50 },
    { id: 2, title: "utils", amount: 100 },
    { id: 3, title: "rent", amount: 50 }
]


export const expensesRoute = new Hono()
.get("/", async (c) => {
    return c.json({ expenses: fakeExpenses })
})
.post("/", zValidator("json", createPostSchema), async (c) => {
    const expense = await c.req.valid("json")
    fakeExpenses.push({id: fakeExpenses.length + 1, ...expense})
    console.log(expense)
    
    c.status(201)

    return c.json({})
})
.get("/total-spent", (c) => {
    const total = fakeExpenses.reduce((acc, expense) => acc + expense.amount, 0)
    return c.json({total})
})
.get("/:id{[0-9]+}", c => {
    const id = Number.parseInt(c.req.param('id'))
    const expense = fakeExpenses.find(expense => expense.id === id)
    if (!expense) {
        return c.notFound()
    }
    return c.json({expense})
})
.delete("/:id{[0-9]+}", c => {
    const id = Number.parseInt(c.req.param('id'))
    const expense = fakeExpenses.find(expense => expense.id === id)
    if (!expense) {
        return c.notFound()
    }
    const deletedExpense = fakeExpenses.splice(id-1, 1)
    return c.json({expense: deletedExpense})
})
// .put