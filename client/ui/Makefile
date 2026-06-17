
update-dist:
	npm run html-dist

.PHONY: update-dist


lint:
	npm run tsc-check

.PHONY: lint

index-entries.json: index-entries.txt
	npm run make-index-map >$@

# vi: se ts=4 sw=4 noet:
