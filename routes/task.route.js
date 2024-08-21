const express = require('express')
const taskModel = require('../models/task.model')
const taskRouter = express.Router()
const checkAdmin = require('../middlewares/checkAdmin.middleware')
const authenticate = require('../middlewares/auth.middleware')
const Authorize = require('../middlewares/authorization.middleware')


// Create/Add a new task
taskRouter.post('/add-task', authenticate, async (req, res) => {
    const { title, description, status } = req.body
    const userId = req.user._id
    try {
        if (!title || !description || !status) {
            return res.status(400).json({ message: 'All fields are required' })
        }
        const newTask = new taskModel({
            title,
            description,
            status,
            userId
        })

        await newTask.save()
        res.status(201).json({ message: `Task Created SuccessFully` })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})



// Get all the tasks
taskRouter.get('/', authenticate, async (req, res) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const tasks = await taskModel.find({ userId })
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');
        if (tasks.length > 0) {
            res.status(200).json(tasks);
        } else {
            res.status(404).json({ message: 'No Tasks Found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});





// Update a task
taskRouter.patch('/update-task/:id', [authenticate, checkAdmin], Authorize(['admin']), async (req, res) => {
    const userId = req.user._id
    const taskId = req.params.id
    const payload = req.body
    // const { title, description, status } = req.body

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(404).json({ message: 'Invalid Task ID' })
    }

    try {
        const task = await taskModel.findById({ taskId })
        if (!task) {
            return res.status(404).json({ message: 'Task Not Found' });
        }

        if (task.userId.toString() === userId.toString()) {
            const updatedTask = await taskModel.findByIdAndUpdate(taskId, payload, { new: true })
            res.status(200).json({ message: `Task Updated Successfully ${updatedTask}` })
        } else {
            return res.status(403).json({ message: 'Unauthorized to update this task' })
        }
    } catch (error) {
        res.status(500).json({ message: `Error while updating the Task ${error.message}` })
    }
})



// Delete a task
taskRouter.delete('/delete-task/:id', [authenticate, checkAdmin], Authorize(['admin']), async (req, res) => {
    const userId = req.user._id
    const taskId = req.params.id
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(404).json({ message: 'Invalid Task ID' })
    }

    try {
        const task = await taskModel.findById({ taskId })
        if (!task) {
            return res.status(404).json({ message: 'Task Not Found' });
        }

        if (task.userId.toString() === userId.toString()) {
            const deletedTask = await taskModel.findByIdAndDelete(taskId)
            res.status(200).json({ message: `Task Deleted Successfully ${deletedTask}` })
        } else {
            return res.status(403).json({ message: 'Unauthorized to delete this task' })
        }
    } catch (error) {
        res.status(500).json({ message: `Error while deleting the Task ${error.message}` })
    }
})


module.exports = taskRouter