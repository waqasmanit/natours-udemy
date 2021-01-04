class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //QUERY BUILD
    //spread operator because we don't want req.query to be affected
    // console.log(req.query);
    const queryObj = { ...this.queryString };
    const excludeFields = ['sort', 'page', 'fields', 'limit'];
    excludeFields.forEach((ele) => delete queryObj[ele]);

    //advance query
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //console.log(JSON.parse(queryString));

    //Model.find() returns Query object, so query is now Query object
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //SORTING
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      //console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    //SELECTING PERTICULAR FIELD
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      //console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    //PAGINATION
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryString.page) {
    //   const numTours = Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }
    return this;
  }
}

module.exports = APIfeatures;
