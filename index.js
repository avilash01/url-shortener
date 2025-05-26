const express = require('express');
const { connectToMongoDB } = require('./connect');
const urlRoute = require('./routes/url');
const URL = require('./models/url'); 
const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/short-url")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use("/url", urlRoute);

app.get('/:shortId', async (req, res) => {
  const shortId = req.params.shortId;

  try {
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ error: "Short URL not found" });
    }


    res.redirect(entry.redirectURL);
  } catch (error) {
    console.error("Error finding and updating URL:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
