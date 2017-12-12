const fs = require('fs');
const util = require('../util');
const product = {};

/***********************************************/

/***********************************************/

product.saveProduct = (jProduct, fCallback) => {
  // Check if the image size is above 0
  if (jProduct.productImg.size > 0) {
    const imgId = util.createId();
    // If so, define a new path and fs.rename
    const imgName = 'product-' + imgId + '.jpg';
    const imgPath = '/img/products/' + imgName;
    const imgPathAbsolute = __dirname + '/../public' + imgPath;
    jProduct.img = imgPath;
    fs.renameSync(jProduct.productImg.path, imgPathAbsolute);
  }

  delete jProduct.productImg;

  global.db.collection('products').insertOne(jProduct, (err, result) => {
    if (err) {
      return fCallback(true);
    }
    jProduct._id = result.insertedId;
    return fCallback(false, jProduct);
  });
};

/***********************************************/

/***********************************************/

product.updateProduct = (jProductInfo, fCallback) => {
  const jProduct = {
    id: jProductInfo.id,
    name: jProductInfo.productName,
    price: jProductInfo.productPrice,
    inventory: jProductInfo.productInventory
  };

  // Check if the image size is above 0
  if (jProductInfo.productImg.size > 0) {
    // If so, define a new path and fs.rename
    const imgName = 'product-' + jProduct.id + '.jpg';
    const imgPath = '/img/products/' + imgName;
    const imgPathAbsolute = __dirname + '/../public' + imgPath;
    jProduct.img = imgPath;
    fs.renameSync(jProductInfo.productImg.path, imgPathAbsolute);
  }

  const ajProducts = [jProduct];

  const sajProducts = JSON.stringify(ajProducts);
  fs.writeFile(__dirname + '/../data/products.txt', sajProducts, err => {
    if (err) {
      return fCallback(true);
    }
    return fCallback(false);
  });
};

/***********************************************/

/***********************************************/

product.getAllProducts = fCallback => {
  global.db
    .collection('products')
    .find()
    .toArray((err, data) => {
      if (err) {
        return fCallback(true);
      }
      return fCallback(false, data);
    });
};

/***********************************************/

/***********************************************/

product.getProduct = (sId, fCallback) => {
  fs.readFile(__dirname + '/../data/products.txt', 'utf8', (err, data) => {
    if (err) {
      return fCallback(true);
    }
    // Parse data
    const ajProducts = JSON.parse(data);
    // Find a product with matching id
    let productFound = false;
    ajProducts.forEach(product => {
      if (product.id === sId) {
        // if the ids match, send along with the callback
        productFound = true;
        return fCallback(false, product);
      }
    });
    // Else, return error
    if (!productFound) {
      return fCallback(true);
    }
  });
};

/***********************************************/

/***********************************************/

product.deleteProduct = (sId, fCallback) => {
  fs.readFile(__dirname + '/../data/products.txt', 'utf8', (err, data) => {
    if (err) {
      return fCallback(true);
    }
    // Parse data
    const ajProducts = JSON.parse(data);
    // Find a product with matching id
    let productFound = false;
    ajProducts.forEach((product, i) => {
      if (product.id === sId) {
        // if the ids match, delete the product from the array
        ajProducts.splice(i, 1);
        productFound = true;
        // and write the array back to the file
        const sajProducts = JSON.stringify(ajProducts);
        fs.writeFile(__dirname + '/../data/products.txt', sajProducts, err => {
          if (err) {
            return fCallback(true);
          }
          return fCallback(false);
        });
      }
    });
    // If no product matched, return error
    if (!productFound) {
      return fCallback(true);
    }
  });
};

/***********************************************/

/***********************************************/

product.buyProduct = (sId, fCallback) => {
  fs.readFile(__dirname + '/../data/products.txt', 'utf8', (err, data) => {
    if (err) {
      return fCallback(true);
    }
    // Parse data
    const ajProducts = JSON.parse(data);
    // Find a product with matching id
    let productFound = false;
    ajProducts.forEach((product, i) => {
      if (product.id === sId) {
        // if the ids match, create response object
        const jRes = {
          name: product.name
        };
        productFound = true;
        // Check if there is inventory
        if (product.inventory > 0) {
          // Reduce the inventory by one
          product.inventory--;
          // write new inventory to response
          jRes.newInventory = product.inventory;
          jRes.status = 'success';
          // and write the array back to the file
          const sajProducts = JSON.stringify(ajProducts);
          fs.writeFile(
            __dirname + '/../data/products.txt',
            sajProducts,
            err => {
              if (err) {
                return fCallback(true);
              }
              return fCallback(false, jRes);
            }
          );
        } else {
          // If there is no more inventory
          // return without errors, but with a status of 'noInventory'
          jRes.status = 'noProducts';
          return fCallback(false, jRes);
        }
      }
    });
    // If no product matched, return error
    if (!productFound) {
      return fCallback(true);
    }
  });
};

/***********************************************/

/***********************************************/

module.exports = product;
