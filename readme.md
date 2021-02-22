# AudioToLunii

AudioToLunii is a cli app that automates the creation of a ZIP folder you can upload to your Lunii using [STUdio](https://github.com/marian-m12l/studio).

## Installation

Use [npm](https://github.com/npm/cli) to install it:

```sh
$ npm install -g audiotolunii
```

### Other Requirements

The following cli apps need to be available in your system:

- `ffmpeg`
- `imagemagick`


## Usage

Basic commands:

```sh
$ audioToLunii podcast -url https://feed.ausha.co/B6r8OclKP6gn -limit 30
$ audioToLunii audio -path /home/Binaries/histoires/extrait -title "Raconte moi des histoires"
$ audioToLunii test => test your installation
```

## Examples:

### Preparing a local audiobook

Here's a quick example of putting together an audiobook composed of multiple episodes, let's say you already have recordings of some special stories:

- Hansel and Gretel
- The three little pigs
- Rapunzel

In order to prepare the audio book, place the audio files in a folder in your file system (mp3 and m4a audio formats are supported), note that file names are going to be converted to audio using the google text to speech API so make sure to give the files a readable name. You may also want to give each file name a proper numeric prefix so that you can confirm the order of the episodes, e.g:

```sh
/home/user/foo/maman-lit-des-histoires
├── épisode-1-hansel-et-gretel.mp3
├── épisode-2-les-trois-petits-cochons.mp3
└── épisode-3-raiponce.mp3
```

#### (Optional) Adding custom images to your stories

AudioToLunii will generate numeric images for each of your stories, in case you want to use custom images you can also place jpg files inside the folder that can be converted.

**NOTE:** Custom image files needs to be 320x240px **jpg** files. Only whites are recognized by Lunii's screen so the best is to start with a black canvas and have any icons/drawing/text in white.

Custom image files for each story should be named after their index position in the list of stories. Continuing from the previous example, the thumbnail image for the story: `épisode-1-hansel-et-gretel.mp3` should be named `1.jpg`, and so on - in case you want a custom thumbnail/icon for Lunii's initial menu then you should name that file `0.jpg`. Here's how our previous example project files structure will look like with both images and sound assets:

```sh
/home/user/foo/maman-lit-des-histoires
├── 0.jpg
├── 1.jpg
├── 2.jpg
├── 3.jps
├── épisode-1-hansel-et-gretel.mp3
├── épisode-2-les-trois-petits-cochons.mp3
└── épisode-3-raiponce.mp3
```

### Finalizing the local audiobook project

Once all your assets are ready, you can pack everything using **audioToLunii**, set the correct file system path to the audiobook folder using the `-path` argument. There's also a configurable `-title` option that allows for defining a name to be used in the Lunii main menu:

```sh
$ audioToLunii audio -path /home/user/foo/maman-lit-des-histoires -title "Les histoires de maman"
```

Running this command will generate a zip file in the current working directory, this zip file can then be uploaded to your Lunii hardware using the [STUdio](https://github.com/marian-m12l/studio) app.

## TODO

Langage selector, only in french at this time




## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
