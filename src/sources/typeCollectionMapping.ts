import { Collection, Entitytyping } from "../../generated-types/type-defs";

export const dishacledElodyTypeCollectionMapping: {
  [test: string]: Collection;
} = {
  [Entitytyping.Pipeline]: Collection.Entities,
  [Entitytyping.Runner]: Collection.Entities,
  [Entitytyping.Processor]: Collection.Entities,
  [Entitytyping.Channel]: Collection.Entities,
};
