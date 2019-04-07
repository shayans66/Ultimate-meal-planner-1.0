const express = require('express');
const bodyParser = require("body-parser");
const axios = require('axios');
const Vision = require('@google-cloud/vision');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const API_KEY = 'XUVPTddV3TNR8Bts0DR9JyY7Zftxiv7OgPa8OFsb';

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, 'uploads/')
    }
});

const upload = multer({storage: storage});

const app = express();
const router = express.Router();
const port = 6154;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('static'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/vision', upload.single('media'), function (req, res) {
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "./uploads/image.jpg");

    const extension = path.extname(req.file.originalname).toLowerCase();
    if (['.jpg', '.jpeg'].indexOf(extension) >= 0) {
        fs.rename(tempPath, targetPath, async () => {
            const client = new Vision.ImageAnnotatorClient();

            const [result] = await client.labelDetection(targetPath);
            const labels = result.labelAnnotations;

            console.log(labels);

            res.status(200).send({
                success: true,
                list: labels
            })
        });
    } else {
        fs.unlink(tempPath, () => {
            res.status(403)
                .contentType("text/plain")
                .end("Only .jpg files are allowed!");
        });
    }
});

app.get('/', function (req, res) {
    res.render('index.pug')
});

app.post('/', function (req, res) {
    let description;
    axios.get('https://api.nal.usda.gov/ndb/search/', {
        params: {
            api_key: API_KEY,
            q: req.body.food[0],
            max: 1,
            ds: 'Standard Reference'
        }
    }).then(function (response) {
        axios.get('https://api.nal.usda.gov/ndb/V2/reports', {
            params: {
                api_key: API_KEY,
                ndbno: response.data.list.item[0].ndbno
            }
        }).then(function (response) {
            description = response.data.foods[0].food;
            res.render('index.pug', {food: description});
        }).catch(function (response) {
            console.error(response);
            res.render('index.pug');
        });
    }).catch(function (response) {
        console.error(response);
        res.render('index.pug');
    });
});

app.get('/list', (req, res) => {
    axios.get('https://api.nal.usda.gov/ndb/search/', {
        params: {
            api_key: API_KEY,
            q: req.query.food,
            max: req.query.max,
            ds: 'Standard Reference'
        }
    }).then(function (response) {
        res.status(200).send({
            success: true,
            list: response.data.list
        })
    }).catch(function (response) {
        console.error(response);
        res.status(400);
    });
});

app.get('/foodDescription', (req, res) => {
    axios.get('https://api.nal.usda.gov/ndb/V2/reports/', {
        params: {
            api_key: API_KEY,
            ndbno: req.query.foodId
        }
    }).then(function (response) {
        console.log(response.data);
        res.status(200).send({
            success: true,
            desription: response.data.foods[0].food
        })
    }).catch(function (response) {
        console.error(response);
        res.status(400);
    });
});

module.exports = router;

app.listen(port, () => console.log(`Listening on port ${port}.`));

