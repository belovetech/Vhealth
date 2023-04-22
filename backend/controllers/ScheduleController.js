const Schedule = require("../models/Schedule")

const getDoctorAvail = async (req, res) => {
    const user = req.user
    const userId = user.id
    const { providerId } = req.body
    const currentDate = new Date.now()

    const schedules = await Schedule.find({
        date: { $lte: currentDate },
        status: 'pending',
        providerId: providerId
    })

    const unavailableDates = schedules.map(schedule => schedule.date)
}

const bookSchedule =  async (req, res) => {
    const { date, time, providerId } = req.body
    const existingsSchedules = await Schedule.find({
        providerId: providerId,
        date: { $lte: date }
    })
    if (existingsSchedules) {
        const schedule = existingsSchedules.find(existingsSchedule.time === time)
        if (schedule) {
           return res.status(400).json({'message': 'date and time unavailable'})
        }
    }
    // create new schedule
    const newSchedule = await Schedule.create({

    })
}

module.exports = {
    getDoctorAvail,
    bookSchedule
}
