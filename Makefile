BIN = ./node_modules/.bin/
JSX_SOURCES = $(wildcard view/*.jsx)

dist/%.js: view/%.jsx
	$(BIN)/jsx $< > .js && mv .js $@

VIEWS = $(patsubst view/%.jsx,dist/%.js,$(JSX_SOURCES))

jsx:: $(VIEWS)

all:: jsx dist

dist: jsx
	$(BIN)/browserify TodoApp.js -o dist/TodoApp.app.js

prepare::
	if [ ! -e dist/ ]; then mkdir dist; fi
	npm install

clean:
	find . -name '*.app.js' | xargs rm ;
	find . -name '*.min.js' | xargs rm ;
	rm dist/*.js ;

todo::
	@echo
	@git grep -w --color -n 'TO\DO'
	@echo

lint::
	$(BIN)/jshint $(SOURCES)


