import {
  createEditor,
  doc,
  p,
  table,
  tr as row,
  td,
  tdEmpty,
  strong,
  atomInline
} from '../test-helpers';
import { Fragment } from 'prosemirror-model';
import {
  canInsert,
  removeNodeAtPos,
  findCellClosestToPos
} from '../src/helpers';

describe('helpers', () => {
  describe('canInsert', () => {
    it('should return true if insertion of a given node is allowed at the current cursor position', () => {
      const { state } = createEditor(doc(p('one<cursor>')));
      const {
        selection: { $from }
      } = state;
      const node = state.schema.nodes.atomInline.createChecked();
      expect(canInsert($from, node)).toBe(true);
    });

    it('should return true if insertion of a given Fragment is allowed at the current cursor position', () => {
      const { state } = createEditor(doc(p('one<cursor>')));
      const {
        selection: { $from }
      } = state;
      const node = state.schema.nodes.atomInline.createChecked();
      expect(canInsert($from, Fragment.from(node))).toBe(true);
    });

    it('should return false a insertion of a given node is not allowed', () => {
      const { state } = createEditor(
        doc(p(strong('zero'), 'o<cursor>ne'), p('three'))
      );
      const {
        selection: { $from }
      } = state;
      const node = state.schema.nodes.paragraph.createChecked(
        {},
        state.schema.text('two')
      );
      expect(canInsert($from, node)).toBe(false);
    });

    it('should return false a insertion of a given Fragment is not allowed', () => {
      const { state } = createEditor(
        doc(p(strong('zero'), 'o<cursor>ne'), p('three'))
      );
      const {
        selection: { $from }
      } = state;
      const node = state.schema.nodes.paragraph.createChecked(
        {},
        state.schema.text('two')
      );
      expect(canInsert($from, Fragment.from(node))).toBe(false);
    });
  });

  describe('removeNodeAtPos', () => {
    it('should remove a block top level node at the given position', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('x'), p('one')));
      const newTr = removeNodeAtPos(3)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('x')));
    });

    it('should remove a nested inline node at the given position', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('one', atomInline())));
      const newTr = removeNodeAtPos(4)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('one')));
    });
  });

  describe('findCellClosestToPos', () => {
    it('should return a cell object closest to a given `$pos`', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(row(td(p('one one')), tdEmpty), row(td(p('two two')), tdEmpty))
        )
      );
      const cell = findCellClosestToPos(tr.doc.resolve(4));
      expect(cell.node.type.name).toEqual('table_cell');
      expect(cell.pos).toEqual(2);
    });

    it('should return `undefined` if there is no cell close to a given `$pos`', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('one')));
      const cell = findCellClosestToPos(tr.doc.resolve(4));
      expect(cell).toBeUndefined();
    });
  });
});
