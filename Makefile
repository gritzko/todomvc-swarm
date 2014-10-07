BIN         = ./node_modules/.bin
JSX_SOURCES = $(wildcard view/*.jsx)
SOURCES = *.js model/*.js view/*.jsx
TARGETS     = dist/TodoApp.app.js dist/LocalTodoApp.app.js

all: libs dist todo

libs:
	npm install
	curl -L -o dist/react-0.11.2.min.js http://fb.me/react-0.11.2.min.js

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


