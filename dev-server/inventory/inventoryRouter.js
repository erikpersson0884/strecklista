const express = require('express');
let items = require('./items.json');


const router = express.Router();


// Helper function to sort items
const sortItems = (items, sort) => {
    switch (sort) {
        case 'cheap':
            return items.sort((a, b) => a.price - b.price);
        case 'expensive':
            return items.sort((a, b) => b.price - a.price);
        case 'new':
            return items.sort((a, b) => b.addedTime - a.addedTime);
        case 'old':
            return items.sort((a, b) => a.addedTime - b.addedTime);
        case 'popular':
        default:
            return items.sort((a, b) => b.timesPurchased - a.timesPurchased);
    }
};

// GET /group/item endpoint
router.get('/', (req, res) => {
    const { sort = 'popular', visibleOnly = true } = req.query;

    let filteredItems = items;

    if (visibleOnly === 'true') {
        filteredItems = filteredItems.filter(item => item.visible);
    }

    const sortedItems = sortItems(filteredItems, sort);

    res.json({items: sortedItems});
});

router.patch('/:id', (req, res) => {
    let { id } = req.params;
    const updatedItem = req.body;

    let item = items.find(item => item.id === Number(id));


    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }

    items = items.map(item => {
        if (item.id === Number(id)) {
            console.log("changing", updatedItem);
            return { ...item, ...updatedItem };
        }
        return item;
    });

    console.log(items.map(item => item.displayName));


    res.json({ item });
});

module.exports = router;

