# Read me
[![Dependency Status](https://gemnasium.com/katsugeneration/redmine-gantt.svg)](https://gemnasium.com/katsugeneration/redmine-gantt)

## Usage
you want to use redmine-gantt, you should act under command.

```
git clone  https://github.com/katsugeneration/redmine-gantt.git
cd redmine-gantt
npm install
touch settings.json
```

before you use redmine-gantt, you make settings.json that written Redmine access information.

```json:settings.json
{
	"name" : "Redmine login name",
	"password" : "Redmine login Password",
	"host" : "Redmine host name",
	"protocol" : "access protocol (http or https)"
}
```

finally, you run start command.

```
npm run start
```
