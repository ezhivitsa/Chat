#Chat#

Chat with strong server on node.js, database mongodb and client which write using module pattern of programming on require.js.

##Server Installation##

1. Install latest Ruby from WEB: [http://rubyinstaller.org/downloads/](http://rubyinstaller.org/downloads/)
	>**!IMPORTANT: in installation check checkbox include ruby to path**
2. Write in command prompt, instructions how to open command prompt for windows [http://windows.microsoft.com/en-us/windows-vista/open-a-command-prompt-window](http://windows.microsoft.com/en-us/windows-vista/open-a-command-prompt-window)
```
$ gem update --system 
```
```
$ gem install compass
```
3. Install node.js from WEB: [http://nodejs.org/](url:http://nodejs.org/)
4. Install Python v2.X.X (latest, but not version 3.X.X) form WEB: [https://www.python.org/downloads/](https://www.python.org/downloads/)
	>**!IMPORTANT: in installation select to include Python to path or include it himself: [http://stackoverflow.com/questions/3701646/how-to-add-to-the-pythonpath-in-windows-7](http://stackoverflow.com/questions/3701646/how-to-add-to-the-pythonpath-in-windows-7)** 
5. Install grunt using command prompt, see instructions at: [http://gruntjs.com/getting-started#installing-the-cli](http://gruntjs.com/getting-started#installing-the-cli) at paragraph Installing the CLI

6. Go to the project dirrectory (**~\app** folder) and run command prompt from it, instruction: [http://lifehacker.com/5989434/quickly-open-a-command-prompt-from-the-windows-explorer-address-bar](http://lifehacker.com/5989434/quickly-open-a-command-prompt-from-the-windows-explorer-address-bar)
7. Write in command prompt to download project dependences
```
$ npm install
```

##Web development Installation##
1. Server start steps
2. Install bower using command prompt, see instructions at: [http://bower.io/](http://bower.io/)
3. Go to the project WEB dirrectory (**~\app\public** folder) and run command prompt from it, instruction: [http://lifehacker.com/5989434/quickly-open-a-command-prompt-from-the-windows-explorer-address-bar](http://lifehacker.com/5989434/quickly-open-a-command-prompt-from-the-windows-explorer-address-bar)
7. Write in command prompt to download project dependences
```
$ npm install
```
```
$ bower install
```

##Starting server##

To start server on your PC need to change some credentials:

1. In file ``server.js``, at **~\app** folder, change
 * ``host`` and ``port`` values to your PC ``ip`` or ``localhost`` and ``port`` at 11 and 12 lines;
 * uncomment and write your mongo credentials from 16 to 20 lines, because tested db can be deleted after a while.
2. Go to **~\public\js** folder and change in ``dataSource.js`` file domain variable to a host same as in ``server.js``

#####Strart app#####
1. Go to the project WEB dirrectory (**~\app\public** folder) and run command prompt from it, instruction: [http://lifehacker.com/5989434/quickly-open-a-command-prompt-from-the-windows-explorer-address-bar](http://lifehacker.com/5989434/quickly-open-a-command-prompt-from-the-windows-explorer-address-bar)
2. Write in command prompt to start server
``$ node server.js``
3. Go to the project WEB dirrectory (**~\app\public** folder) and run command prompt from it, instruction: [http://lifehacker.com/5989434/quickly-open-a-command-prompt-from-the-windows-explorer-address-bar](http://lifehacker.com/5989434/quickly-open-a-command-prompt-from-the-windows-explorer-address-bar)
4. Write in command prompt 
``
/* to recompile js files */
$ grunt build
/* to recompile and run watch task */
$ grunt w 
``
