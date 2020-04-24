const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const commandExists = require('command-exists');
const _ = require('lodash');
let Parser = require('rss-parser');
let parser = new Parser();
const { v4: uuidv4 } = require('uuid');
const cliProgress = require('cli-progress');
const uid = require('uid');
const wget = require('node-wget-promise');
const googleTTS = require('google-tts-api');
const execSh = require('exec-sh');
const Zip = require('adm-zip');
const {listFilesSync} = require('list-files-in-dir');

var getExtension = function (filename) {
  var re = /(?:\.([^.]+))?$/;
  var ret = re.exec(filename)[1];
  var retO = ret.split('?')
  return (retO[0])
}

marketraitment = (folderAssets, folderAssetsBefore, folder, podcast, jsonContent, luniiExport, limit, bar1) => {
  execSh('cd ' + folderAssetsBefore + '  && for i in `seq 1 ' + podcast.stories.length + '`; do convert -size 320x240 -background none -fill white label:"$i" -trim \ -size 320x240 -gravity center xc:#333333 +swap -composite $i.png; done', true, function (err) {
    bar1.increment();
    execSh('cd ' + folderAssetsBefore + '  && for i in *.mp3; do ffmpeg -i "$i"  -filter:a "volume=5dB"  -acodec pcm_s16le -ac 1 -ar 32000 "../assets/${i%.*}.wav"; done', true, function (err) {
      bar1.increment();
      execSh('cd ' + folderAssetsBefore + '  && for i in *.m4a; do ffmpeg -i "$i"  -filter:a "volume=5dB"  -acodec pcm_s16le -ac 1 -ar 32000 "../assets/${i%.*}.wav"; done', true, function (err) {
        bar1.increment();
        execSh('cd ' + folderAssetsBefore + '  && for i in *.png; do convert $i -resize 320x240 -background white -flatten -alpha off  -type truecolor -depth 24 "../assets/${i%.*}.bmp"; done', true, function (err) {
          bar1.increment();
          execSh('cd ' + folderAssetsBefore + '  && for i in *.jpg; do convert $i -resize 320x240 -background white -flatten -alpha off  -type truecolor -depth 24 "../assets/${i%.*}.bmp"; done', true, function (err) {
            bar1.increment();
            execSh('cd ' + folderAssetsBefore + '  && convert thumbnail -resize 320x240 -type truecolor -depth 24 "../thumbnail.png"', true, function (err) {
              fs.writeFile(folder + "/story.json", jsonContent, 'utf8', function (err) {
                var zip = new Zip();
                zip.addLocalFolder(folderAssets, 'assets');
                zip.addLocalFile(folder + '/story.json');
                zip.addLocalFile(folder + '/thumbnail.png');
                var filename = podcast.title + "_auto-" + uuidv4() + "-v" + luniiExport.version + ".zip";
                zip.writeZip("./" + filename, function(err) {
                  bar1.update(parseInt(limit) + 8);
                  bar1.stop();
                  console.log("your file : " + filename + ' is create')
                });


              });
            });
          });
        });
      });
    });
  });

}



exports.podcast = async (url, limit) => {

  // create new progress bar
  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar1.start(parseInt(limit) + 8, 0);


  var podcast = await fse.readJSON(__dirname + '/assets/podcast.json');
  var luniiExport = await fse.readJSON(__dirname + '/assets/luniiExport.json');
  var luniiExport_PackSelectionStage = await fse.readJSON(__dirname + '/assets/luniiExport_PackSelectionStage.json');
  var luniiExport_Story = await fse.readJSON(__dirname + '/assets/luniiExport_Story.json');
  var luniiExport_StoryAction = await fse.readJSON(__dirname + '/assets/luniiExport_StoryAction.json');
  var luniiExport_questionStage = await fse.readJSON(__dirname + '/assets/luniiExport_questionStage.json');
  var luniiExport_menuoptionStage = await fse.readJSON(__dirname + '/assets/luniiExport_menuoptionStage.json');
  var luniiExport_questionAction = await fse.readJSON(__dirname + '/assets/luniiExport_questionAction.json');
  var luniiExport_optionAction = await fse.readJSON(__dirname + '/assets/luniiExport_optionAction.json');

  await fse.emptyDir( __dirname + "/tmp");
  const folder =  __dirname + "/tmp/atl-"+uid(16);
  await fse.mkdirp(folder);
  await fse.mkdirp(folder + '/assets');
  const folderAssets = folder + '/assets/'
  await fse.mkdirp(folder + '/assets_before');
  const folderAssetsBefore = folder + '/assets_before/'

  let feed = await parser.parseURL(url);

  podcast.title = feed.title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
  podcast.description = feed.description.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
  podcast.audio = uid(16);
  //get title audio
  var titleUrl = await googleTTS(podcast.title, 'fr', 0.8)
  await wget(titleUrl, { output: folderAssetsBefore + podcast.audio + '.mp3' });
  podcast.audio = podcast.audio + '.wav'
  podcast.selectAudio = uid(16);
  //get title audio
  var titleSUrl = await googleTTS("Choisis ton histoire", 'fr', 0.8)
  await wget(titleSUrl, { output: folderAssetsBefore + podcast.selectAudio + '.mp3' });
  podcast.selectAudio = podcast.selectAudio + '.wav'

  podcast.image = uid(16);
  //get image
  await wget(feed.image.url, { output: folderAssetsBefore + podcast.image + '.' + getExtension(feed.image.url) });
  await wget(feed.image.url, { output: folderAssetsBefore + "thumbnail" });
  podcast.image = podcast.image + '.bmp'
  podcast.uid = uuidv4();
  podcast.menuUid = uuidv4();
  podcast.groupId = uuidv4();
  podcast.menuAction = uuidv4();
  podcast.menuOption = uuidv4();

  //on ajoute dans l'export
  luniiExport.title = podcast.title + '_auto';
  luniiExport.description = podcast.description
  // on créé le stage menu
  luniiExport_PackSelectionStage.uuid = podcast.uid;
  luniiExport_PackSelectionStage.image = podcast.image;
  luniiExport_PackSelectionStage.audio = podcast.audio;
  luniiExport_PackSelectionStage.okTransition.actionNode = podcast.menuUid;
  luniiExport.stageNodes.push(luniiExport_PackSelectionStage);
  // on créé le 
  luniiExport_questionStage.uuid = podcast.menuAction;
  luniiExport_questionStage.groupId = podcast.groupId;
  luniiExport_questionStage.audio = podcast.selectAudio;
  luniiExport_questionStage.okTransition.actionNode = podcast.menuOption;
  luniiExport.stageNodes.push(luniiExport_questionStage);
  // on créé le questionActionStage 
  luniiExport_questionAction.id = podcast.menuUid;
  luniiExport_questionAction.groupId = podcast.groupId;
  luniiExport_questionAction.options = [podcast.menuAction]
  luniiExport.actionNodes.push(luniiExport_questionAction);
  // on créé le optionStage
  luniiExport_optionAction.id = podcast.menuOption;
  luniiExport_optionAction.groupId = podcast.groupId;

  bar1.increment();
  var x = 1;
  for (const item of feed.items) {
    if (x <= limit) {
      story = Object.assign({}, {});
      story.title = item.title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
      story.audio = uid(16);
      //get title audio
      var titleUrl = await googleTTS(story.title, 'fr', 1)
      await wget(titleUrl, { output: folderAssetsBefore + story.audio + '.mp3' });
      story.title = story.title.replace(/[`~!@#$%^&*()_|+\-=?;:'éèàêùûïîâ",.<>\{\}\[\]\\\/]/gi, '');
      story.audio = story.audio + '.wav';
      story.mp3 = uid(16);
      //get image
      await wget(item.enclosure.url, { output: folderAssetsBefore + story.mp3 + '.' + getExtension(item.enclosure.url) });
      story.mp3 = story.mp3 + '.wav';
      story.uid = uuidv4();
      story.action = uuidv4();
      story.storyAction = uuidv4();

      podcast.stories.push(story);

      // on créé la story
      clone_luniiExport_Story = _.clone(luniiExport_Story);
      clone_luniiExport_Story.uuid = story.uid;
      clone_luniiExport_Story.name = story.title;
      clone_luniiExport_Story.audio = story.mp3;
      clone_luniiExport_Story.okTransition.actionNode = podcast.menuUid;
      clone_luniiExport_Story.homeTransition.actionNode = podcast.menuUid;
      clone_luniiExport_Story.groupId = story.uid;
      luniiExport.stageNodes.push(JSON.parse(JSON.stringify(_.clone(clone_luniiExport_Story))))

      // on créé l'action
      clone_luniiExport_menuoptionStage = _.clone(luniiExport_menuoptionStage);
      clone_luniiExport_menuoptionStage.uuid = story.action;
      clone_luniiExport_menuoptionStage.groupId = podcast.groupId;
      clone_luniiExport_menuoptionStage.name = story.title;
      clone_luniiExport_menuoptionStage.image = x + '.bmp';
      clone_luniiExport_menuoptionStage.audio = story.audio;
      clone_luniiExport_menuoptionStage.okTransition.actionNode = _.clone(story.storyAction);
      luniiExport.stageNodes.push(JSON.parse(JSON.stringify(_.clone(clone_luniiExport_menuoptionStage))));
      luniiExport_optionAction.options.push(story.action);

      // on créé la story Action
      clone_luniiExport_StoryAction = _.clone(luniiExport_StoryAction);
      clone_luniiExport_StoryAction.id = _.clone(_.clone(story.storyAction));
      clone_luniiExport_StoryAction.groupId = story.uid;
      clone_luniiExport_StoryAction.name = story.title + '.storyaction';
      clone_luniiExport_StoryAction.options = [story.uid]
      luniiExport.actionNodes.push(JSON.parse(JSON.stringify(_.clone(clone_luniiExport_StoryAction))));

      delete story;
      bar1.increment();
    }
    x++;
  }

  luniiExport.actionNodes.push(luniiExport_optionAction);

  var jsonContent = JSON.stringify(luniiExport);

  // on traite les fichiers 

  marketraitment(folderAssets, folderAssetsBefore, folder, podcast, jsonContent, luniiExport, limit, bar1 );





};

exports.test = async () => {
  commandExists('ffmpeg', function(err, iscommandExists) {
    if(iscommandExists) {
      console.log("FFmpeg is OK")
    } else {
      console.log("FFmpeg is not installed")
    }
    commandExists('convert', function(err, iscommandExists) {
      if(commandExists) {
        console.log("Imagemagick (convert CLI) is OK")
      } else {
        console.log("Imagemagick (convert CLI) is not installed")
      }
    });
  });
} 


exports.audio = async(pathFolder, title, lang) => {

  files = listFilesSync(pathFolder, 'mp3');
  filesImage = listFilesSync(pathFolder, 'jpg');

  if(files.length == 0)
    console.log("No MP3 files in directory");
  else {
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    var limit = files.length;
    bar1.start(parseInt(limit) + 8, 0);
    // 
    var podcast = await fse.readJSON(__dirname + '/assets/podcast.json');
    var luniiExport = await fse.readJSON(__dirname + '/assets/luniiExport.json');
    var luniiExport_PackSelectionStage = await fse.readJSON(__dirname + '/assets/luniiExport_PackSelectionStage.json');
    var luniiExport_Story = await fse.readJSON(__dirname + '/assets/luniiExport_Story.json');
    var luniiExport_StoryAction = await fse.readJSON(__dirname + '/assets/luniiExport_StoryAction.json');
    var luniiExport_questionStage = await fse.readJSON(__dirname + '/assets/luniiExport_questionStage.json');
    var luniiExport_menuoptionStage = await fse.readJSON(__dirname + '/assets/luniiExport_menuoptionStage.json');
    var luniiExport_questionAction = await fse.readJSON(__dirname + '/assets/luniiExport_questionAction.json');
    var luniiExport_optionAction = await fse.readJSON(__dirname + '/assets/luniiExport_optionAction.json');

    await fse.emptyDir( __dirname + "/tmp");
    const folder =  __dirname + "/tmp/atl-"+uid(16);
    await fse.mkdirp(folder);
    await fse.mkdirp(folder + '/assets');
    const folderAssets = folder + '/assets/'
    await fse.mkdirp(folder + '/assets_before');
    const folderAssetsBefore = folder + '/assets_before/'

    podcast.title = title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    podcast.description = 'no description';
    podcast.audio = uid(16);
    //get title audio
    var titleUrl = await googleTTS(podcast.title, 'fr', 0.8)
    await wget(titleUrl, { output: folderAssetsBefore + podcast.audio + '.mp3' });
    podcast.audio = podcast.audio + '.wav'
    podcast.selectAudio = uid(16);
    //get title audio
    var titleSUrl = await googleTTS("Choisis ton histoire", 'fr', 0.8)
    await wget(titleSUrl, { output: folderAssetsBefore + podcast.selectAudio + '.mp3' });
    podcast.selectAudio = podcast.selectAudio + '.wav'

    podcast.image = uid(16);
    //get image
    if(filesImage.length > 0) {
      await fse.copy(filesImage[0], folderAssetsBefore + '/'+ podcast.image + '.jpg');
      await fse.copy(filesImage[0], folderAssetsBefore + '/thumbnail');
    } else {
      await fse.copy(__dirname + '/assets/thumbnail.png', folderAssetsBefore + '/'+ podcast.image + '.png');
      await fse.copy(__dirname + '/assets/thumbnail.png', folderAssetsBefore + '/thumbnail');
    }
    
    podcast.image = podcast.image + '.bmp'
    podcast.uid = uuidv4();
    podcast.menuUid = uuidv4();
    podcast.groupId = uuidv4();
    podcast.menuAction = uuidv4();
    podcast.menuOption = uuidv4();

    //on ajoute dans l'export
    luniiExport.title = podcast.title + '_auto';
    luniiExport.description = podcast.description
    // on créé le stage menu
    luniiExport_PackSelectionStage.uuid = podcast.uid;
    luniiExport_PackSelectionStage.image = podcast.image;
    luniiExport_PackSelectionStage.audio = podcast.audio;
    luniiExport_PackSelectionStage.okTransition.actionNode = podcast.menuUid;
    luniiExport.stageNodes.push(luniiExport_PackSelectionStage);
    // on créé le 
    luniiExport_questionStage.uuid = podcast.menuAction;
    luniiExport_questionStage.groupId = podcast.groupId;
    luniiExport_questionStage.audio = podcast.selectAudio;
    luniiExport_questionStage.okTransition.actionNode = podcast.menuOption;
    luniiExport.stageNodes.push(luniiExport_questionStage);
    // on créé le questionActionStage 
    luniiExport_questionAction.id = podcast.menuUid;
    luniiExport_questionAction.groupId = podcast.groupId;
    luniiExport_questionAction.options = [podcast.menuAction]
    luniiExport.actionNodes.push(luniiExport_questionAction);
    // on créé le optionStage
    luniiExport_optionAction.id = podcast.menuOption;
    luniiExport_optionAction.groupId = podcast.groupId;

    bar1.increment();
    var x = 1;
    for (const item of files) {
      var name = path.basename(item, '.mp3');

      story = Object.assign({}, {});
      story.title = name.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
      story.audio = uid(16);
      //get title audio
      var titleUrl = await googleTTS(story.title, 'fr', 1)
      await wget(titleUrl, { output: folderAssetsBefore + story.audio + '.mp3' });
      story.title = story.title.replace(/[`~!@#$%^&*()_|+\-=?;:'éèàêùûïîâ",.<>\{\}\[\]\\\/]/gi, '');
      story.audio = story.audio + '.wav';
      story.mp3 = uid(16);
      //get image
      //await wget(item.enclosure.url, { output: folderAssetsBefore + story.mp3 + '.' + getExtension(item.enclosure.url) });
      await fse.copy(item, folderAssetsBefore + '/'+ story.mp3 + '.mp3');
      story.mp3 = story.mp3 + '.wav';
      story.uid = uuidv4();
      story.action = uuidv4();
      story.storyAction = uuidv4();

      podcast.stories.push(story);

      // on créé la story
      clone_luniiExport_Story = _.clone(luniiExport_Story);
      clone_luniiExport_Story.uuid = story.uid;
      clone_luniiExport_Story.name = story.title;
      clone_luniiExport_Story.audio = story.mp3;
      clone_luniiExport_Story.okTransition.actionNode = podcast.menuUid;
      clone_luniiExport_Story.homeTransition.actionNode = podcast.menuUid;
      clone_luniiExport_Story.groupId = story.uid;
      luniiExport.stageNodes.push(JSON.parse(JSON.stringify(_.clone(clone_luniiExport_Story))))

      // on créé l'action
      clone_luniiExport_menuoptionStage = _.clone(luniiExport_menuoptionStage);
      clone_luniiExport_menuoptionStage.uuid = story.action;
      clone_luniiExport_menuoptionStage.groupId = podcast.groupId;
      clone_luniiExport_menuoptionStage.name = story.title;
      clone_luniiExport_menuoptionStage.image = x + '.bmp';
      clone_luniiExport_menuoptionStage.audio = story.audio;
      clone_luniiExport_menuoptionStage.okTransition.actionNode = _.clone(story.storyAction);
      luniiExport.stageNodes.push(JSON.parse(JSON.stringify(_.clone(clone_luniiExport_menuoptionStage))));
      luniiExport_optionAction.options.push(story.action);

      // on créé la story Action
      clone_luniiExport_StoryAction = _.clone(luniiExport_StoryAction);
      clone_luniiExport_StoryAction.id = _.clone(_.clone(story.storyAction));
      clone_luniiExport_StoryAction.groupId = story.uid;
      clone_luniiExport_StoryAction.name = story.title + '.storyaction';
      clone_luniiExport_StoryAction.options = [story.uid]
      luniiExport.actionNodes.push(JSON.parse(JSON.stringify(_.clone(clone_luniiExport_StoryAction))));

      delete story;
      bar1.increment();
      x++;
    }

    luniiExport.actionNodes.push(luniiExport_optionAction);

    var jsonContent = JSON.stringify(luniiExport);

    // on traite les fichiers 

    marketraitment(folderAssets, folderAssetsBefore, folder, podcast, jsonContent, luniiExport, limit, bar1 );

  }
}