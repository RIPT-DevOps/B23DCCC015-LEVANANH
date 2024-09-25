const express = require('express');
const router = express.Router();
const userModel = require('../model/user');
const productModel=require('../model/product');
const cartModel = require('../model/cart');
const { sendOrderConfirmationEmail } = require('../model/emailService')
const mongoose = require('mongoose');
const paymentModel =require('../model/payment')
const cookie = require('cookie-parser')
const session = require('express-session');
const multer = require('multer');
const upload = multer({ dest: 'view/img' });

router.get('/', async (req, res) => {
    try {
        const products = await productModel.find();
        const brands = await productModel.distinct('thuonghieu');
        res.render('trangchu', { products: products , brands: brands }) ;
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi lấy thông tin sản phẩm');
    }
});
router.get('/products', async (req, res) => {
    try {
        const products = await productModel.find();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi lấy thông tin sản phẩm');
    }
});
router.get('/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).send('Sản phẩm không tồn tại');
        }
        res.render('chitiet', { product: product });
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi lấy thông tin sản phẩm');
    }
});


router.get("/giohang" , async (req ,res)=>{
    // Lấy giá trị của cookie userInfo
const userInfoCookie = req.cookies.userInfo;

// Giải mã giá trị của cookie thành một chuỗi đã được giải mã
const decodedUserInfoCookie = decodeURIComponent(userInfoCookie);

// Giải mã chuỗi JSON thành một đối tượng JavaScript
const userInfo = JSON.parse(decodedUserInfoCookie);

// Lấy ID của người dùng từ đối tượng userInfo
const userId = userInfo.ID;
console.log(userId)
    try {
        const cart = await cartModel.findOne({ userId: userId }).populate('items.productId');
        let totalPrice = 0;
        let totalPriceUSD = 0;
        if (!cart) {
            // Nếu không có giỏ hàng, trả về trang giỏ hàng với mảng rỗng
            return res.render('giohang', { cartItems: [], totalPrice: 0, totalPriceUSD:0}); // Khởi tạo totalPrice với giá trị 0
        }
    
        const cartItems = cart.items.map(item => {
            const product = item.productId;
            totalPrice += product.price * item.quantity;
            return {
                _id: product._id,
                name: product.name || 'Unknown Product',
                price: product.price || 0, // Khởi tạo giá sản phẩm với giá trị 0 nếu không có giá trị
                quantity: item.quantity,
                image: product.image || 'path/to/default/image.jpg'
            };
        });
    
        // Tính tổng tiền của các sản phẩm trong giỏ hàng
        totalPriceUSD = totalPrice / 23000;
        // Render trang giỏ hàng với dữ liệu cartItems và totalPrice
        res.render("giohang", { cartItems: cartItems, totalPrice: totalPrice , totalPriceUSD: totalPriceUSD});
    } catch (error) {
        console.error("Lỗi khi lấy thông tin giỏ hàng:", error);
        res.status(500).json({ error: "Đã xảy ra lỗi khi lấy thông tin giỏ hàng." });
    }
});
router.post('/save-payment-info', (req, res) => {
    const { fullName, email, phoneNumber, address, paymentMethod } = req.body;

    // Tạo object chứa thông tin thanh toán
    const paymentInfo = {
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
        address: address,
        paymentMethod: paymentMethod
    };

    // Lưu thông tin thanh toán vào session
    req.session.paymentInfo = paymentInfo;

    console.log('Payment info saved in session:', req.session.paymentInfo);

    // Trả về phản hồi cho client
    res.sendStatus(200); // Hoặc trả về bất kỳ phản hồi nào khác tuỳ theo logic của bạn
});

router.get('/paymentsuccess', async (req, res) => {
    try {
        // Lấy thông tin đơn hàng từ session
        const paymentInfo = req.session.paymentInfo;
        console.log(paymentInfo)
        const userInfoCookie = decodeURIComponent(req.cookies.userInfo);
        const userInfo = JSON.parse(userInfoCookie);
        const userId = userInfo.ID;

        if (!paymentInfo) {
            return res.status(400).send('Thông tin thanh toán không hợp lệ.');
        }

        // Xử lý lưu vào cơ sở dữ liệu
        const { fullName, email, phoneNumber, address, paymentMethod, product } = paymentInfo;
        const cart = await cartModel.findOne({ userId: userId }).populate('items.productId');
        const items = [];
        for (const item of cart.items) {
            const product = await productModel.findById(item.productId);
            items.push({
                productId: item.productId,
                productName: product.name, 
                quantity: item.quantity,
                price : product.price ,
                image : product.image

            });
        }
        const newPayment = new paymentModel({
            name: fullName,
            email: email,
            phone: phoneNumber,
            address: address,
            cartId: cart,
            product,
            items : items,
            status : 'chưa xác nhận',
            method : paymentMethod
        });

        await newPayment.save();

       
        delete req.session.paymentInfo;

       
        res.render('paymentsuccess'); // Thay thế bằng phương thức phù hợp để render trang thanh toán thành công
    } catch (error) {
        console.error('Lỗi khi lưu đơn hàng:', error);
        res.status(500).send('Có lỗi xảy ra khi lưu đơn hàng.');
    }
});
router.get('/dangki', (req, res) => {
    res.render('dangki');
})
router.get('/dangnhap',(req,res)=>{
    res.render('dangnhap');
})
router.get('/admin', async (req, res) => {
    try {
        const payments = await paymentModel.find().populate('items.productId');
        const products = await productModel.find();
        let cartItems = [];
        let processedOrders = [];

        let currentpaymentId = null;
        payments.forEach(payment => {
            let processed = false; // Mặc định đơn hàng chưa được xử lý
            payment.items.forEach(item => {
                if (currentpaymentId !== payment._id) {
                    currentpaymentId = payment._id;
                    cartItems.push({
                        paymentId: currentpaymentId,
                        name: item.productId.productName,
                        price: item.productId.price,
                        quantity: item.quantity,
                        image: item.productId.image,
                        status: payment.status,
                        fullName: payment.name,
                        phone: payment.phone,
                        method:payment.method,
                        processed: false // Đánh dấu đơn hàng chưa được xử lý
                    });
                    if (payment.status === 'xác nhận') {
                        processed = true; // Đánh dấu đơn hàng đã được xử lý
                    }
                } else {
                    cartItems.push({
                        paymentId: currentpaymentId,
                        name: item.productId.productName,
                        price: item.productId.price,
                        quantity: item.quantity,
                        image: item.productId.image,
                        status: payment.status,
                        method:payment.method
                    });
                    if (payment.status === 'xác nhận') {
                        processed = true; // Đánh dấu đơn hàng đã được xử lý
                    }
                }
            });

            if (processed) {
                const processedItems = payment.items.map(item => ({
                    name: item.productId.productName,
                    price: item.productId.price,
                    quantity: item.quantity,
                    image: item.productId.image
                }));
            
                processedOrders.push({
                    paymentId: currentpaymentId,
                    fullName: payment.name,
                    phone: payment.phone,
                    status: payment.status,
                    items: processedItems,
                    method: payment.method
                });
            }
        });
        cartItems = cartItems.filter(item => item.status !== 'xác nhận');
       
        processedOrders.sort((a, b) => b.paymentId - a.paymentId);
        
        res.render('admin', { cartItems: cartItems, products: products, processedOrders: processedOrders });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/admin/updateStatus', async (req, res) => {
    const { paymentId, status } = req.body;
    console.log(paymentId , status)

    try {
        // Thực hiện cập nhật trạng thái của đơn hàng trong cơ sở dữ liệu
        await paymentModel.findByIdAndUpdate(paymentId, { status: status });

        // Sau khi cập nhật thành công, chuyển hướng người dùng đến trang admin lại
        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/dangxuat', (req, res) => {
    res.clearCookie('userInfo');
    res.redirect('/');
});
router.get('/search', async (req, res) => {
    try {
        
        const keyword = req.query.keyword;
        const brands = await productModel.distinct('thuonghieu');

        
        const products = await productModel.find({
            $or: [
                { name: { $regex:".*" + keyword + ".*", $options: 'i' } }, 
            ]
        });

        
        res.render('trangchu', { products: products, brands : brands });
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi tìm kiếm sản phẩm');
    }
});
router.post('/create-user', async (req, res) => {
    try {
        const { username,date, password , confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).send("<script>alert('Mật khẩu không khớp');window.location.href('/dangki')</script>");
        }

        const existingUser = await userModel.findOne({ username: username });
        if (existingUser) {
            return res.status(400).send("<script>alert('Tên tài khoản đã tồn tại');window.location.href = '/dangki'</script>");
            
        }
        
        const dob = new Date(date);
        const newUser = new userModel({ username, password,dateOfBirth:dob});
        await newUser.save();

        res.status(201).redirect('/dangnhap');
        
    } catch (error) {
        console.error(error);
        res.status(500).send("<script>alert('Đã xảy ra lỗi khi tạo tài khoản');window.location.href='/dangki'</script>");
    }
});
router.post('/dangnhap', async (req, res) => {
    try {
        const { username, password } = req.body;
        if(username === 'admin' && Number(password) === 1){
            res.redirect("/admin")
        }
        else{
        const existingUser = await userModel.findOne({ username: username });
        if (!existingUser) {
            return res.status(404).send("<script>alert('Tài khoản không tồn tại');window.location.href='/dangnhap'</script>");

        }
        
        if (password !== existingUser.password) {
            return res.status(401).send("<script>alert('Mật khẩu sai');window.location.href='/dangnhap'</script>");
        }
        const userInfo = {
            username: existingUser.username,
            ID : existingUser._id,
            dateOfBirth : existingUser.dateOfBirth
        };
        const userInfoString = JSON.stringify(userInfo);
        console.log("userInfoString:", userInfoString);
        res.cookie('userInfo', userInfoString, { httpOnly: false });
        res.redirect('/')
        
    }
    } catch (error) {
        console.error(error);
        res.status(500).send("<script>alert('Đã xảy ra lỗi khi đăng nhập');window.location.href='/dangnhap'</script>");
    }
});
router.get('/thongtin',(req,res)=>{
    try {
        
        const userInfoString = req.cookies.userInfo;

      
        const userInfo = JSON.parse(userInfoString);

        
        res.render('thongtin', { user: userInfo });
    } catch (error) {
        console.error(error);
        res.status(500).send("<script>alert('Đã xảy ra lỗi khi lấy thông tin người dùng');window.location.href='/'</script>");
    }
});

router.get('/filter', async (req, res) => {
    try {
        const selectedBrands = req.query.brands ? req.query.brands.split(',') : [];
        const selectedPrices = req.query.prices ? req.query.prices.split(',') : [];

        const brandFilter = selectedBrands.length > 0 ? { thuonghieu: { $in: selectedBrands } } : {};

        const priceFilters = selectedPrices.map(price => {
            switch (price) {
                case '1':
                    return { price: { $lt: 1000000 } };
                case '2':
                    return { price: { $gte: 1000000, $lt: 2000000 } }; 
                case '3':
                    return { price: { $gte: 2000000, $lt: 3000000 } }; 
                case '4':
                    return { price: { $gte: 3000000 } }; 
                default:
                    return {};
            }
        });
        let filterConditions = {};
        if (selectedBrands.length > 0 && selectedPrices.length > 0) {
            filterConditions = { $and: [brandFilter, { $or: priceFilters }] };
        } else if (selectedBrands.length > 0) {
            filterConditions = brandFilter;
        } else if (selectedPrices.length > 0) {
            filterConditions = { $or: priceFilters };
        }

        const filteredProducts = await productModel.find(filterConditions);

        res.json(filteredProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Đã xảy ra lỗi khi lọc sản phẩm' });
    }
});

router.post('/addToCart', async (req, res) => {
    try {
        const userInfoString = decodeURIComponent(req.cookies.userInfo);
        const userInfo = JSON.parse(userInfoString);
        const userId = userInfo.ID;
        const product = req.body.product;

        if (!product || !product._id) {
            return res.status(400).json({ message: "Thông tin sản phẩm không hợp lệ." });
        }

        let cart = await cartModel.findOne({ userId: userId });
        if (!cart) {
            cart = new cartModel({ userId: userId, items: [] });
        }

        // Tìm sản phẩm trong giỏ hàng bằng cách chuyển đổi productId thành chuỗi
        const existingItem = cart.items.find(item => item.productId.toString() === product._id.toString());
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({ productId: product._id, quantity: 1 });
        }

        await cart.save();
        res.status(200).json({ message: "Sản phẩm đã được thêm vào giỏ hàng.", cart });
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
        res.status(500).json({ error: "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng." });
    }
});
router.delete('/delete', async (req, res) => {
    try {
        const { itemId } = req.body;
        console.log(itemId)
        const userInfoCookie = decodeURIComponent(req.cookies.userInfo);
        const userInfo = JSON.parse(userInfoCookie);
        const userId = userInfo.ID;

        // Tìm giỏ hàng của người dùng và xóa sản phẩm cụ thể
        const cart = await cartModel.findOne({ userId: userId }).populate("items.productId");
        console.log(cart)
        const itemIndex = cart.items.findIndex(item => item.productId._id.toString() === itemId);
        console.log(itemIndex)
        if (itemIndex !== -1) {
            cart.items.splice(itemIndex, 1); // Xóa sản phẩm khỏi giỏ hàng
            await cart.save();
            // Trả về danh sách sản phẩm cập nhật
            res.json({ success: true, message: "Sản phẩm đã được xóa khỏi giỏ hàng"});
        } else {
            res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm trong giỏ hàng" });
        }
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi xóa sản phẩm khỏi giỏ hàng." });
    }
});
router.post('/thanhtoan', async (req, res) => {
        const { fullName, email, phoneNumber,product, address, paymentMethod} = req.body;
        const userInfoCookie = decodeURIComponent(req.cookies.userInfo);
        const userInfo = JSON.parse(userInfoCookie);
        const userId = userInfo.ID;
        
        
        try {
            const cart = await cartModel.findOne({ userId: userId }).populate('items.productId');
            if (!cart || cart.items.length === 0) {
                return res.status(400).send(`
                    <script>
                        alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.');
                        window.location.href = '/'; 
                    </script>
                `);
            }
            const items = [];
            for (const item of cart.items) {
                const product = await productModel.findById(item.productId);
                items.push({
                    productId: item.productId,
                    productName: product.name, 
                    quantity: item.quantity,
                    price : product.price ,
                    image : product.image

                });
            }
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }
        const newPayment = new paymentModel({
            name: fullName,
            email: email,
            phone: phoneNumber,
            address: address,
            cartId: cart,
            product,
            items : items,
            status : 'chưa xác nhận',
            method : paymentMethod
        });
        await newPayment.save();
        await cartModel.findOneAndDelete({ userId: userId });

        await sendOrderConfirmationEmail(email , items);
        res.status(200).send(`
            <script>
                alert('Đơn hàng đã được xác nhận qua email của bạn !');
                window.location.href = '/'; 
            </script>
        `);
    } catch (err) {
        res.status(500).send('Có lỗi xảy ra khi lưu dữ liệu.');
    }
});
router.patch('/admin/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const updateData = req.body;
        
        // Xây dựng một object chứa các trường cần cập nhật
        let updatedFields = {};
        for (const key in updateData) {
            if (updateData.hasOwnProperty(key) && updateData[key] !== undefined && updateData[key] !== null && updateData[key] !== '') {
                updatedFields[key] = updateData[key];
            }
        }
        
        // Thực hiện cập nhật chỉ các trường được cung cấp, giữ nguyên các trường không được cung cấp
        const updatedProduct = await productModel.findOneAndUpdate(
            { _id: productId },
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).send('Sản phẩm không tồn tại');
        }

        res.status(200).send(`
                <script>
                alert('Đã cập nhật thành công');
                window.location.href='/admin'
               
            </script>
            `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi cập nhật sản phẩm');
    }
});

router.delete('/admin/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        await productModel.findByIdAndDelete(productId);
        res.status(200).send(`
            <script>
                alert('Xóa thành công !');
                window.location.href = '/admin'; 
            </script>
            `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi xóa sản phẩm');
    }
});
router.post('/admin/product', upload.single('image'), async (req, res) => {
    try {
        
        const { name, price, thuonghieu, category } = req.body;
        const imagePath = `img/${req.file.originalname}`; 

        
        const newProduct = new productModel({
            name,
            price,
            image:imagePath,
            thuonghieu,
            category
            
        });


        await newProduct.save();

       
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Đã xảy ra lỗi khi thêm sản phẩm mới');
    }
});

module.exports = router;