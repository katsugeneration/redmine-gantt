[![Build Status](https://travis-ci.org/katsugeneration/redmine-gantt.svg)](https://travis-ci.org/katsugeneration/redmine-gantt)
[![Dependency Status](https://gemnasium.com/katsugeneration/redmine-gantt.svg)](https://gemnasium.com/katsugeneration/redmine-gantt)
[![Code Climate](https://codeclimate.com/github/katsugeneration/redmine-gantt/badges/gpa.svg)](https://codeclimate.com/github/katsugeneration/redmine-gantt)
[![Test Coverage](https://codeclimate.com/github/katsugeneration/redmine-gantt/badges/coverage.svg)](https://codeclimate.com/github/katsugeneration/redmine-gantt/coverage)

## Usage
if you want to use redmine-gantt, you should act follow command.

```
git clone  https://github.com/katsugeneration/redmine-gantt.git
cd redmine-gantt
npm install
gulp babel
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
npm start
```

## License
MIT
