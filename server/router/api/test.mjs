import express from 'express';

const router = express.Router({ mergeParams: true }); // import parent params

// Router GET Url= /api/test/
router.get('/', function (req, res) {
    var Type = req.query.t; //      type
    var ID = req.query.id; //       id
    if (!Type) Type = 'name'; //    default type
    if (!ID) {
        res.status(500).json({ error: 'require id param' });
        return;
    }
    if (Type == 'name') {
        res.json({
            title: 'This is Title - ' + ID,
            items: [
                {
                    index: 1,
                    name: 'Hanny',
                },
                {
                    index: 2,
                    name: 'Marry',
                },
                {
                    index: 3,
                    name: 'Tony',
                },
            ],
        });
    } else {
        res.status(200).json({ error: 'access denied' });
    }
});

// Router POST Url= /api/test/
router.post('/', function (req, res) {
    if (!req.body) return res.status(404).send('404');
    //
    res.json({ error: 'is not supported' });
});

export { router };
