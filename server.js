const express = require('express')
const app = express()

app.get('/', (req, res) => res.redirect('index.html'));
app.use(express.static('.'))

app.listen(3000);
