const Provider = require("../models/Provider")
const Schedule = require("../models/Schedule")
const { getCallAccessToken } = require("../utils/getCallToken")

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
    // get doctor profile
    const doctor = await Provider.findById(providerId)
    res.status(200).json({
        unavailableDates,
        doctor
    })
}

const bookSchedule =  async (req, res) => {
    const userId = req.user.id
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
        providerId: providerId,
        userId: userId,
        date: date,
        time: time,
    })

    res.status(200).json({
        message: 'success',
        callDetails: JSON.parse(JSON.stringify(newSchedule))
    })
}

// join call: user
// check if the schedule has not expired
// need the room name which will correspond to the call or schedule ID

const userJoinVideoCall = async (req, res) => {
    const userId = req.user.id
    const { scheduleId } = req.body
    if (!scheduleId) {
        return res.status(400).json({
            message: 'meeting Id is missing'
        })
    }
    const call = await Schedule.find({
        userId: userId,
        _id: scheduleId,
        status: 'pending'
    })
    if (call) {
        return res.status(404).json({
            message: 'meeting not found'
        })
    }
    const callAccessToken = getCallAccessToken(scheduleId, userId)
    return {
        callAccessToken: callAccessToken,
        roomName: scheduleId,
        userId: userId
    }
}

module.exports = {
    getDoctorAvail,
    bookSchedule,
    userJoinVideoCall
}
