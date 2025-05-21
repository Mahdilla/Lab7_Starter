describe('Basic user flow for Website', () => {
  // First, visit the lab 7 website
  beforeAll(async () => {
    await page.goto('https://cse110-sp25.github.io/CSE110-Shop/');
  });

  // Each it() call is a separate test
  // Here, we check to make sure that all 20 <product-item> elements have loaded
  it('Initial Home Page - Check for 20 product items', async () => {
    console.log('Checking for 20 product items...');

    // Query select all of the <product-item> elements and return the length of that array
    const numProducts = await page.$$eval('product-item', (prodItems) => {
      return prodItems.length;
    });

    // Expect there that array from earlier to be of length 20, meaning 20 <product-item> elements where found
    expect(numProducts).toBe(20);
  });

  // Check to make sure that all 20 <product-item> elements have data in them
  it('Make sure <product-item> elements are populated', async () => {
    console.log('Checking to make sure <product-item> elements are populated...');

    // Start as true, if any don't have data, swap to false
    let allArePopulated = true;

    // Query select all of the <product-item> elements
    const prodItemsData = await page.$$eval('product-item', prodItems => {
      return prodItems.map(item => {
        // Grab all of the json data stored inside
        return data = item.data;
      });
    });

    // Check all product items, not just the first one
    for (let i = 0; i < prodItemsData.length; i++) {
      console.log(`Checking product item ${i+1}/${prodItemsData.length}`);
      
      const currentItem = prodItemsData[i];
      if (currentItem.title.length == 0) { allArePopulated = false; }
      if (currentItem.price.length == 0) { allArePopulated = false; }
      if (currentItem.image.length == 0) { allArePopulated = false; }
    }

    // Expect allArePopulated to still be true
    expect(allArePopulated).toBe(true);
  }, 10000);

  // Check to make sure that when you click "Add to Cart" on the first <product-item> that
  // the button swaps to "Remove from Cart"
  it('Clicking the "Add to Cart" button should change button text', async () => {
    console.log('Checking the "Add to Cart" button...');

    // Get the first product item
    const firstProductItem = await page.$('product-item');
    
    // Get its shadow root
    const shadowRoot = await firstProductItem.getProperty('shadowRoot');
    
    // Get the button within the shadow root
    const button = await shadowRoot.$('button');
    
    // Click the button
    await button.click();
    
    // Check the button text
    const buttonText = await button.getProperty('innerText');
    const buttonTextValue = await buttonText.jsonValue();
    
    // Verify the button now says "Remove from Cart"
    expect(buttonTextValue).toBe('Remove from Cart');
  }, 2500);

  // Check to make sure that after clicking "Add to Cart" on every <product-item> that the Cart
  // number in the top right has been correctly updated
  it('Checking number of items in cart on screen', async () => {
    console.log('Checking number of items in cart on screen...');

    // Get all product items
    const productItems = await page.$$('product-item');
    
    // Click "Add to Cart" on all remaining items
    // Skip the first one since we already added it in the previous test
    for (let i = 1; i < productItems.length; i++) {
      const shadowRoot = await productItems[i].getProperty('shadowRoot');
      const button = await shadowRoot.$('button');
      await button.click();
    }
    
    // Check if the cart count is 20
    const cartCount = await page.$eval('#cart-count', element => element.innerText);
    expect(Number(cartCount)).toBe(20);
  }, 10000);

  // Check to make sure that after you reload the page it remembers all of the items in your cart
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');

    // Reload the page
    await page.reload();
    
    // Wait for the page to load
    await page.waitForSelector('product-item');
    
    // Check all product items to make sure their buttons say "Remove from Cart"
    const productItems = await page.$$('product-item');
    let allSayRemoveFromCart = true;
    
    for (let i = 0; i < productItems.length; i++) {
      const shadowRoot = await productItems[i].getProperty('shadowRoot');
      const button = await shadowRoot.$('button');
      const buttonText = await button.getProperty('innerText');
      const buttonTextValue = await buttonText.jsonValue();
      
      if (buttonTextValue !== 'Remove from Cart') {
        allSayRemoveFromCart = false;
        break;
      }
    }
    
    expect(allSayRemoveFromCart).toBe(true);
    
    // Check if the cart count is still 20
    const cartCount = await page.$eval('#cart-count', element => element.innerText);
    expect(Number(cartCount)).toBe(20);
  }, 10000);

  // Check to make sure that the cart in localStorage is what you expect
  it('Checking the localStorage to make sure cart is correct', async () => {
    console.log('Checking the localStorage...');
    
    // Check localStorage for the cart
    const cart = await page.evaluate(() => {
      return localStorage.getItem('cart');
    });
    
    // The cart should contain all items from 1 to 20
    expect(cart).toBe('[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]');
  });

  // Checking to make sure that if you remove all of the items from the cart that the cart
  // number in the top right of the screen is 0
  it('Checking number of items in cart on screen after removing from cart', async () => {
    console.log('Checking number of items in cart on screen...');

    // Get all product items
    const productItems = await page.$$('product-item');
    
    // Click "Remove from Cart" on all items
    for (let i = 0; i < productItems.length; i++) {
      const shadowRoot = await productItems[i].getProperty('shadowRoot');
      const button = await shadowRoot.$('button');
      await button.click();
    }
    
    // Check if the cart count is now 0
    const cartCount = await page.$eval('#cart-count', element => element.innerText);
    expect(Number(cartCount)).toBe(0);
  }, 10000);

  // Checking to make sure that it remembers us removing everything from the cart
  // after we refresh the page
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');

    // Reload the page
    await page.reload();
    
    // Wait for the page to load
    await page.waitForSelector('product-item');
    
    // Check all product items to make sure their buttons say "Add to Cart"
    const productItems = await page.$$('product-item');
    let allSayAddToCart = true;
    
    for (let i = 0; i < productItems.length; i++) {
      const shadowRoot = await productItems[i].getProperty('shadowRoot');
      const button = await shadowRoot.$('button');
      const buttonText = await button.getProperty('innerText');
      const buttonTextValue = await buttonText.jsonValue();
      
      if (buttonTextValue !== 'Add to Cart') {
        allSayAddToCart = false;
        break;
      }
    }
    
    expect(allSayAddToCart).toBe(true);
    
    // Check if the cart count is still 0
    const cartCount = await page.$eval('#cart-count', element => element.innerText);
    expect(Number(cartCount)).toBe(0);
  }, 10000);

  // Checking to make sure that localStorage for the cart is as we'd expect for the
  // cart being empty
  it('Checking the localStorage to make sure cart is correct', async () => {
    console.log('Checking the localStorage...');
    
    // Check localStorage for the cart
    const cart = await page.evaluate(() => {
      return localStorage.getItem('cart');
    });
    
    // The cart should be empty
    expect(cart).toBe('[]');
  });
});