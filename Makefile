BIN         = ./node_modules/.bin
JSX_SOURCES = $(wildcard view/*.jsx)
SOURCES = *.js model/*.js view/*.jsx
LIBS = node_modules/**/*
TARGETS     = dist/react.min.js dist/TodoApp.app.js dist/LocalTodoApp.app.js

all: dist todo

dist: $(TARGETS)

dist/%.app.js: dist/react.min.js $(SOURCES)
	@$(BIN)/browserify -x react -e $(patsubst dist/%.app.js,%.js,$@) -o $@

dist/react.min.js: $(LIBS)
	@mkdir -p $(@D)
	@$(BIN)/browserify -d -r react -p [minifyify --map dist/react.map.json --output dist/react.map.json] -o dist/react.min.js

prepare:
	@if [ ! -e node_modules/ ]; then npm install; fi

clean:
	@rm -rf dist

todo:
	@echo
	@git grep -w --color -n 'TO\DO'
	@echo

lint:
	$(BIN)/jshint $(SOURCES)


