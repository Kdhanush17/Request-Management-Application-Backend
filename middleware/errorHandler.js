module.exports = (err, req, res, next) => {
    console.error(err.stack);

    let statusCode = 500;
    let message = 'Server Error';

    if (err.message) {
        // Custom errors from services
        if (err.message.includes('Invalid credentials') || err.message.includes('Forbidden')) {
            statusCode = 400; // Or 401/403 depending on exact context
            message = err.message;
        } else if (err.message.includes('not found') || err.message.includes('exist')) {
            statusCode = 404;
            message = err.message;
        } else if (err.message.includes('Cannot assign') || err.message.includes('Invalid status') || err.message.includes('must be approved') || err.message.includes('must be actioned')) {
            statusCode = 400;
            message = err.message;
        }
    }

    res.status(statusCode).json({ message });
};
