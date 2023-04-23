require("dotenv").config({ path: '../.config.env' })
const AccessToken = require("twilio").jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant;

const twilioClient = require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);  

const getCallAccessToken = (roomName, userId) => {
    // create an access token
    const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
    );
    token.identity = userId
    // create a video grant for this specific room
    const videoGrant = new VideoGrant({
        room: roomName,
    });
  
    // add the video grant
    token.addGrant(videoGrant);
    // serialize the token and return it
    return token.toJwt();
};

const findOrCreateRoom = async (roomName) => {
    try {
        // see if the room exists already. If it doesn't, this will throw
        // error 20404.
        await twilioClient.video.v1.rooms(roomName).fetch();
    } catch (error) {
        // the room was not found, so create it
        if (error.code == 20404) {
            await twilioClient.video.v1.rooms.create({
                uniqueName: roomName,
                type: "go",
            });
        } else {
        // let other errors bubble up
        throw error;
        }
    }
};

module.exports = {
    getCallAccessToken,
    findOrCreateRoom,
}