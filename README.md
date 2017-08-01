# fb-photo-download
Download photos from Facebook Page locally and cloudinary upload

### Prerequisites

Requirement node.js, npm, facebook graph api token (with permission photos).

```
npm install
```

Get a Facebook Api Token
[Get Your Fb Graph Api token Here](https://developers.facebook.com/tools/explorer "Graph Api explorer")
and Select permission

![Graph token](https://raw.githubusercontent.com/MaxySpark/fb-photo-album-download/master/Screenshot/fbs4.jpg "Graph Api Token")

#### Options

  --album, -n, -a          Name Of The Album(default: Timeline Photos)  [string]
  --pages, -p              Name Of The page (default: me)               [string]
  --since_date, -s         Since date (default: today)
  --upload_cloudinary, -c  Upload cloudinary (default: false)          [boolean]
  --cloudinary_folder, -f  cloudinary folder                            [string]
  --help, -h               Show help                                   [boolean]

#### Usage
```
$node app --album "Album Name" --page "Page Name" --since_date "Since Date"
$node app --help
```
