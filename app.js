const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');
const app = express();

app.get('/template/preview', (req, res) => {
    res.sendFile(path.join(__dirname, 'gap-template.html'));
});

// Route to generate PNG from the template.html file, targeting .container class with custom size
app.get('/template/download', async (req, res) => {
    try {
        // Path to the HTML file
        const htmlPath = path.join(__dirname, 'gap-template.html');

        // Launch Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set viewport size (365px width, 15rem height => 240px)
        await page.setViewport({
            width: 365, // width in pixels
            height: 240, // height in pixels (15rem)
            deviceScaleFactor: 4
        });

        // Load the template.html file into Puppeteer
        await page.goto('file://' + htmlPath, { waitUntil: 'load' });

        // Ensure the .container element is the size you want before taking a screenshot
        const container = await page.$('.container');

        // Resize the container if necessary
        await page.evaluate(() => {
            const container = document.querySelector('.container');
            container.style.width = '365px';
            container.style.height = '15rem';
        });

        // Capture a screenshot of only the .container element
        const screenshotBuffer = await container.screenshot();

        // Close the Puppeteer browser
        await browser.close();

        // Set response headers to trigger the download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename="container-screenshot.png"');

        // Send the PNG image as the response, triggering a download in the browser
        res.send(screenshotBuffer);
    } catch (error) {
        console.error('Error processing template:', error);
        res.status(500).send('Error generating PNG');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
