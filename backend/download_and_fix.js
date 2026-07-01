const fs = require('fs');
const https = require('https');
const path = require('path');

const destDir = path.join(__dirname, '../frontend/public/images');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const mapping = [
  { id: 1, url: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { id: 2, url: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { id: 3, url: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { id: 4, url: 'https://m.media-amazon.com/images/M/MV5BMmFiZGZjMmEtMTA0Ni00MzA2LTljMTYtZGI2MGJmZWYzZTQ2XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg' },
  { id: 5, url: 'https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { id: 6, url: 'https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { id: 7, url: 'https://m.media-amazon.com/images/M/MV5BNWI0Y2NkOWEtMmM2OC00MjQ3LWI1YzItZGQxYzQ3NzI4NWZmXkEyXkFqcGc@._V1_SX300.jpg' },
  { id: 8, url: 'https://m.media-amazon.com/images/M/MV5BMmU5NGJlMzAtMGNmOC00YjJjLTgyMzUtNjAyYmE4Njg5YWMyXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { id: 9, url: 'https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { id: 10, url: 'https://m.media-amazon.com/images/M/MV5BN2U4OTdmM2QtZTkxYy00ZmQyLTg2N2UtMDdmMGJmNDhlZDU1XkEyXkFqcGc@._V1_QL75_UY562_CR1,0,380,562_.jpg' },
  { id: 11, url: 'https://m.media-amazon.com/images/M/MV5BY2Q2ZmI5ZjUtNWVhMC00YzJkLTlmYjMtY2RmZDhkNzEzYjZhXkEyXkFqcGc@._V1_SX300.jpg' },
  { id: 12, url: 'https://m.media-amazon.com/images/M/MV5BYzEwZjczOTktYzU1OS00YjJlLTgyY2UtNWEzODBlN2RjZDEwXkEyXkFqcGc@._V1_QL75_UX380_CR0,20,380,562_.jpg' },
  { id: 13, url: 'https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg' },
  { id: 14, url: 'https://m.media-amazon.com/images/M/MV5BYWQ4YmNjYjEtOWE1Zi00Y2U4LWI4NTAtMTU0MjkxNWQ1ZmJiXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { id: 15, url: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { id: 16, url: 'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg' },
  { id: 17, url: 'https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_QL75_UY562_CR8,0,380,562_.jpg' },
  { id: 18, url: 'https://m.media-amazon.com/images/M/MV5BMTk4ODQzNDY3Ml5BMl5BanBnXkFtZTcwODA0NTM4Nw@@._V1_QL75_UX380_CR0,0,380,562_.jpg' },
  { id: 19, url: 'https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg' }
];

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error("Failed to download " + url + ", status code " + res.statusCode));
        return;
      }
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      res.on('end', () => resolve());
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading images locally...');
  for (const item of mapping) {
    const filename = "m" + item.id + ".jpg";
    const filepath = path.join(destDir, filename);
    try {
      await downloadImage(item.url, filepath);
      console.log("Downloaded " + filename);
    } catch (e) {
      console.error(e.message);
    }
  }

  console.log('Updating server.js...');
  const serverFile = path.join(__dirname, 'src/server.js');
  let content = fs.readFileSync(serverFile, 'utf8');

  for (const item of mapping) {
    const regex = new RegExp("(id:\\s*" + item.id + ",[^]*?image:\\s*')[^']+(')", 'g');
    content = content.replace(regex, "$1/images/m" + item.id + ".jpg$2");
  }

  if (!content.includes('id: 20')) {
    content = content.replace(/\];\s*let bookingsMock/, `,
  {
    id: 20,
    title: 'Interstellar (IMAX)',
    genre: 'Khoa học viễn tưởng, Tâm lý',
    rating: 9.0,
    duration: '2 giờ 49 phút',
    image: '/images/m1.jpg',
    description: 'Bản chiếu rạp định dạng IMAX siêu nét.',
    price: 150000
  }
];
let bookingsMock`);
  }

  fs.writeFileSync(serverFile, content, 'utf8');
  console.log('Done modifying server.js');
}

main();
