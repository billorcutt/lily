#!/bin/sh

echo BUILDING VERSION $1

rm -rf build
mkdir build
cd lily
find * | grep -v 'CVS' | grep -v '\.svn' | grep -v ~$ | grep -v '#' | grep -v .DS_Store | zip lily.xpi -@
mv lily.xpi ../build
cd ..
cp docs/README build/
cp docs/CHANGELOG build/
cp docs/Quick\ Start.pdf build/
cp -r Demos build/
cp -r Examples build/
cp lily/LICENSE build/LICENSE
cd build
find * | grep -v 'CVS' | grep -v '\.svn' | grep -v ~$ | grep -v '#' | grep -v .DS_Store | zip $1.zip -@
