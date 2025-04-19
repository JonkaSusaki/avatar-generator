<div style="text-align: center;">
    
![Avatar](./assets/avatar.png)

# Easy avatar generator

</div>

Create kaleidoscopic avatars based on string input.

## Installation

```
yarn add @jonkasusaki/avatar-generator
```

OR

```
npm install @jonkasusaki/avatar-generator
```


## Usage

```
import {generateAvatar} from '@jonkasusaki/avatar-generator';

// Generate buffer
const buffer = await generateAvatar('your input text', 400, 400)

// Do whatever you want
fs.writeFileSync("your/destination/folder", buffer);
```

## About

This project is basically just a wrapper for [PureImage](https://github.com/joshmarinacci/node-pureimage)