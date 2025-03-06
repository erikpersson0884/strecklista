const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

app.get('/group/purchase', (req, res) => {
    const purchases = [
        {
            id: 45435,
            purchaseTime: 1738594127,
            purchasedBy: "7ba99a26-9ad3-4ad8-ab7f-5891c2d82a4b",
            purchasedFor: "7ba99a26-9ad3-4ad8-ab7f-5891c2d82a4b",
            items: [
                { id: 954210554821, count: 1 }
            ]
        },
        {
            id: 45434535,
            purchaseTime: 1738594001,
            purchasedBy: "7ba99a26-9ad3-4ad8-ab7f-5891c2d82a4b",
            purchasedFor: "b69e01cd-01d1-465e-adc5-99d017b7fd74",
            items: [
                { id: 954210554821, count: 3 },
                { id: 754210554621, count: 1 }
            ]
        }
    ];

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const paginatedPurchases = purchases.slice(offset, offset + limit);
    const nextOffset = offset + limit < purchases.length ? offset + limit : null;
    const previousOffset = offset - limit >= 0 ? offset - limit : null;

    const response = {
        data: {
            purchases: paginatedPurchases,
            next: nextOffset !== null ? `http://localhost:3001/group/purchase?limit=${limit}&offset=${nextOffset}` : null,
            previous: previousOffset !== null ? `http://localhost:3001/group/purchase?limit=${limit}&offset=${previousOffset}` : null
        }
    };

    res.json(response);
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});