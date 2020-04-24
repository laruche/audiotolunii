# AudioToLunii

AudioToLunii is NPM Globale module use to create ZIP folder you can upload to your Lunii Studio
You have to use [LuniiStudio](https://github.com/marian-m12l/studio) to add it 

## Installation

Use the package manager npm to install.

```bash
npm install -g audiotolunii

```
Watchout : you have to install ffmpeg and imagemagick on your desktop


## Usage

```nodejs

$ audioToLunii podcast -url https://feed.ausha.co/B6r8OclKP6gn -limit 30
$ audioToLunii audio -path /home/Binaries/histoires/extrait -title "Raconte moi des histoires"
$ audioToLunii test => test your installation

```

## TODO

Langage selector, only in french at this time




## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
