const nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587,                
    secure: false,            
    auth: {
        user: 'leanh9331@gmail.com', 
        pass: 'ssvk tzzg odvm hbij',
    }
});

function sendOrderConfirmationEmail(email,items) {
    let textContent = 'Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đã được nhận và đang chờ xử lý.\n\nThông tin về đơn hàng:\n\n';
    items.forEach((item, index) => {
        textContent += `${index + 1}. ${item.productName}: ${item.quantity} sản phẩm\nGiá: ${item.price} VNĐ\n\n`;
    });
    let mailOptions = {
        from: '"ANHLVSHOP" <leanh9331@gmail.com>', 
        to: email,
        subject: 'Xác nhận đơn hàng',
        text: textContent
    };

    return transporter.sendMail(mailOptions);
}

module.exports = {
    sendOrderConfirmationEmail
};
