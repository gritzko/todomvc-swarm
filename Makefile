BIN         = ./node_modules/.bin
JSX_SOURCES = $(wildcard view/*.jsx)
SOURCES = *.js model/*.js view/*.jsx
TARGETS     = dist/TodoApp.app.js dist/LocalTodoApp.app.js

all: libs dist todo

libs:
	npm install
	if [ ! -e dist/ ]; then mkdir dist; fi
	cp node_modules/react/dist/react.min.js dist/react.min.js

dist: $(TARGETS)

dist/%.app.js: $(SOURCES)
	@mkdir -p $(@D)
	@$(BIN)/browserify -x react -e $(patsubst dist/%.app.js,%.js,$@) -o $@

clean:
	@rm -rf dist

todo:
	@echo
	@git grep -w --color -n 'TO\DO'
	@echo

lint:
	$(BIN)/jshint $(SOURCES)


