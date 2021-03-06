const generateMessages = (username, text) => {
    return {
        username: username,
        text: text,
        createdAt: new Date().getTime(),
    }
}

module.exports = {
    generateMessages
}