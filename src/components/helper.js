

export default class Helper {

  /**
   * 
   */
  static haveIntersection(r1, r2) {
    return (
      r1.x >= r2.x && r1.x < r2.x + r2.width &&
      r1.y >= r2.y && r1.y < r2.y + r2.height
    );
  }

  /**
   * Merge lists in list. 
   * eg [['A','B']['C']] => ['A','B','C']
   */
  static flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? Helper.flatten(toFlatten) : toFlatten);
    }, []);
  }
} 