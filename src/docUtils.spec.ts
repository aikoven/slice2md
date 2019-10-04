import dedent = require('dedent');
import {parseDoc} from './docUtils';

test('parseDoc', () => {
  expect(
    parseDoc(
      dedent(`
        Text before inline tag {@first inline content} more text {@second lol}
        another line

        @tag1 tag with single line
        @tag2 tag with
        multiple
        lines
        @tag3
      `),
    ),
  ).toMatchSnapshot();
});
