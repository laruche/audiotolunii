#!/usr/bin/env node
const args = require('get-arguments');
 
const commandName = "audioToLunii"; //your CLI command name
const validCommands = ['podcast','audio', 'test']; //your allowed commands

const parser = require("../lib/parser");
 
args(commandName,validCommands,function(argsObject){
  if(argsObject===null) return;
  //console.log(argsObject);
  if(argsObject.command == "podcast")
  {
    // OLI : http://radiofrance-podcast.net/podcast09/rss_19721.xml
    // Pomme d'api : https://feed.ausha.co/B6r8OclKP6gn
    // Les petites histoires : https://rss.acast.com/les-ptites-histoires
    var url = "",
        limit = 30;
    if(argsObject.args['-url'] != null) {
      url = argsObject.args['-url'][0];
      if(argsObject.args['-limit'] != null)
        limit = argsObject.args['-limit'][0]
      console.log("We will convert " + limit + " of your podcast url : " + url);
      parser.podcast(url, limit);

    } else {
      console.log("You must specifiy -url of your podcast")
    }
  } 

  if(argsObject.command == "audio")
  {
      var path = "./",
        title = "no-title";
    if(argsObject.args['-path'] != null) {
      path = argsObject.args['-path'][0];
      if(argsObject.args['-title'] != null)
        title = argsObject.args['-title'][0]
      console.log("We will convert mp3 files in "+path+" with name : " + title);
      parser.audio(path, title);

    } else {
      console.log("You must specifiy -url of your podcast")
    }
  } 

  if(argsObject.command == "test")
  {
   parser.test();
  } 
  //argsObject returns null if:
    //the incorrect command was typed by the user 
    //the arguments syntax typed by the user was incorrect
  //do your magic here
  //use argsObject.command
  //use argsObject.args
});