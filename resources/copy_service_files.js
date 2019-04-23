const fs = require('fs');
const path = require('path');
const util = require('util');
const xcode = require('xcode')

const copyFile = util.promisify(fs.copyFile);

const ANDROID_SERVICE_FILE = "google-services.json"
const IOS_SERVICE_FILE = "GoogleService-Info.plist"

const ANDROID_DIR = "platforms/android"
const IOS_DIR = "platforms/ios"

const rethrow = func => err => {
	func(err);
	throw err;
}

const verboseCopy = (src, dest) => {
  console.log(`Copying ${src} to ${dest}...`);
  const dir = path.dirname(dest)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  return copyFile(src, dest, fs.constants.COPYFILE_FICLONE).then(() => {
    console.log(`Successfully copied to ${dest}`);
  })
}

const addConfigToXcode = (name, root) => {
  const projectPath = path.join(root, IOS_DIR, name + '.xcodeproj/project.pbxproj')
  const proj = xcode.project(projectPath)

	console.log('Adding a config file to Xcode');
  return new Promise((resolve, reject) => {
    proj.parse((err) => {
      if (err) reject(err)
      proj.addResourceFile(IOS_SERVICE_FILE, {})
      fs.writeFileSync(projectPath, proj.writeSync())
      console.log('Successfully added to Xcode');
      resolve()
    })
  })
}

const copyAndroidServiceFile = root => verboseCopy(
	path.join(root, ANDROID_SERVICE_FILE),
	path.join(root, ANDROID_DIR, ANDROID_SERVICE_FILE),
	fs.constants.COPYFILE_FICLONE
).catch(rethrow(() => console.error(
	`Failed to copy ${ANDROID_SERVICE_FILE}; make sure to download it via firebase`
)))

const copyIosServiceFile = (root, name) => verboseCopy(
	path.join(root, IOS_SERVICE_FILE),
	path.join(root, IOS_DIR, name, 'Resources', IOS_SERVICE_FILE),
	fs.constants.COPYFILE_FICLONE
).catch(rethrow(() => console.error(
	`Failed to copy ${IOS_SERVICE_FILE}; make sure to download it via firebase`
)))

module.exports = ctx => {
	const platforms = ctx.opts.cordova.platforms;
	const tasks = []

	platforms.forEach(platform => {
		if(platform === "android")
			tasks.push(copyAndroidServiceFile(ctx.opts.projectRoot));
		else if(platform === "ios")
      tasks.push(copyIosServiceFile(ctx.opts.projectRoot, getName(ctx))
        .then(() => addConfigToXcode(getName(ctx), ctx.opts.projectRoot)))
	});

	return Promise.all(tasks).then(() => null)
}

function getName (ctx) {
  const fs = require('fs');
  const path = require('path');
  const config_xml = path.join(ctx.opts.projectRoot, 'config.xml');
  const et = ctx.requireCordovaModule('elementtree');
  const data = fs.readFileSync(config_xml).toString();
  const etree = et.parse(data);

  return etree.findtext('./name')
}
