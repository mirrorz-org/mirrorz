import fs from 'fs';
import http from 'http';
import path from 'path';
import mime from 'mime-types';

const directory = 'dist';
const port = process.argv.length > 2 ? parseInt(process.argv[2]) : 8000;

export const server = http.createServer(function (req, res) {
    var file = path.join(directory, req.url ?? '');
    fs.stat(file, (err, stat) => {
        if (err || stat.isDirectory())
            file = path.join(directory, '404.html');
        fs.readFile(file, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify(err));
            } else {
                const contentType = mime.lookup(file);
                res.setHeader('Access-Control-Allow-Origin', '*');
                if (contentType)
                    res.setHeader('Content-Type', contentType);
                res.writeHead(200);
                res.end(data);
            }
        });
    });
}).listen(port);