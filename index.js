const puppeteer = require('puppeteer')

;(async () => {
	const browser = await puppeteer.launch({ headless: false })
	const page = await browser.newPage()
	await page.setViewport({ width: 2420, height: 1080 })

	// Navigate to the website
	await page.goto('https://www.cepsum.umontreal.ca/abonnements/')

	// pick the a tag with the title attribute "utilisateur"
	await page.waitForSelector('a[title="utilisateur"]')
	await page.click('a[title="utilisateur"]')

	await new Promise(resolve => setTimeout(resolve, 1000))

	const allPages = await browser.pages()
	const popupPage = allPages[allPages.length - 1]

	await popupPage.waitForSelector('#mainfrm')
	await popupPage.type('#mainfrm', 'ziangxuu@gmail.com')
	await popupPage.waitForSelector('input[type="password"]')
	await popupPage.type('input[type="password"]', 'KpyYp75ND!KUzB2')

	await popupPage.waitForSelector('#lnkPRALIBRE', { timeout: 120000 })
	await popupPage.click('#lnkPRALIBRE')

	// find an a element with the id contain "grdReservations-ajouter"
	await popupPage.waitForSelector('a[id*="grdReservations-ajouter"]')
	await popupPage.click('a[id*="grdReservations-ajouter"]')

	// click on the first child div within the div whose class contain "avec-titre"
	await popupPage.waitForSelector('div[class*="avec-titre"]')
	await popupPage.waitForSelector('div[class*="avec-titre"] > div > div')
	await popupPage.click('div[class*="avec-titre"] > div > div')

	let isDayFound = false
	while (!isDayFound) {
		const result = await popupPage.evaluate(async () => {
			const date = new Date()
			date.setDate(date.getDate() + 2)
			// convert to new york time and convert to yyyy-mm-dd format
			const dateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]

			await new Promise(resolve => setTimeout(resolve, 400))

			const input = document.querySelector(`input[value*="${dateStr}"]`)

			const elements = document.querySelectorAll('a[id*="btnPlage"]')

			console.log('elements', elements.length)
			return input && input.value === dateStr
		})
		if (result) {
			isDayFound = true
		} else {
			await popupPage.waitForSelector('a[id*="btnDateSuiv"]')
			await popupPage.click('a[id*="btnDateSuiv"]')
		}
	}

	await new Promise(resolve => setTimeout(resolve, 200))

	const timeslots = await popupPage.evaluate(async () => {
		const elements = document.querySelectorAll('a[id*="btnPlage"]')
		for (const element of elements) {
			// push if its text contains 17 or 18 or 19 or 20 or 21
			if (
				element.textContent.includes('06:') ||
				element.textContent.includes('20:') ||
				element.textContent.includes('21:') ||
				element.textContent.includes('22:')
			) {
				element.click()

				await new Promise(resolve => setTimeout(resolve, 300))

				// const btnConfirmer = document.querySelector('button[id*="btnConfirmer"]')
				// btnConfirmer.click()

				await new Promise(resolve => setTimeout(resolve, 300))

				// get all options in the select element with the id contain CBOLOCAL and sort them by the text
				const options = document.querySelectorAll('select[id*="CBOLOCAL"] option')

				const extractNumber = str => {
					// Use a regular expression to match the number in the string
					const match = str.match(/\d+/)

					// Check if a match was found
					if (match) {
						// Extracted number as a string
						const numberString = match[0]

						// Convert the string to a number if needed
						const numberValue = parseInt(numberString, 10)

						// console.log(str, numberValue)
					} else {
						console.log('No number found in the string')
					}
				}

				// const sortedOptions = [...options]
				// sortedOptions.sort((a, b) => {
				// 	const formatedA = extractNumber(a.innerText)
				// 	const formatedB = extractNumber(b.innerText)
				// 	console.log('formatedA formatedB', a, formatedA, formatedB)
				// 	if (formatedA < formatedB) {
				// 		return -1
				// 	}
				// 	if (formatedA > formatedB) {
				// 		return 1
				// 	}
				// 	return 0
				// })
				// console.log('sortedOptions', sortedOptions)

				// // Loop through the sorted elements and find their original indices
				// for (const element of sortedOptions) {
				// 	if (
				// 		element.innerText.includes('16') ||
				// 		element.innerText.includes('17') ||
				// 		element.innerText.includes('18')
				// 	) {
				// 		continue
				// 	}
				// 	const originalIndex = [...options].indexOf(element)
				// 	console.log('originalIndex', originalIndex)
				// 	options[originalIndex].selected = true
				// 	return
				// }

				// options[3].selected = true

				for (const option of options) {
					console.log('option', option.innerText)

					if (
						option.innerText.includes('13') ||
						option.innerText.includes('14') ||
						option.innerText.includes('15')
					) {
						option.selected = true
						return elements
					}
				}
			}
		}
		return elements
	})

	console.log('timeslots', timeslots)

	// // reconfirm
	// await new Promise(resolve => setTimeout(resolve, 200))
	// await popupPage.waitForSelector('button[id*="btnConfirmer"]')
	// await popupPage.click('button[id*="btnConfirmer"]')

	// // btnFermer
	// await new Promise(resolve => setTimeout(resolve, 200))
	// await popupPage.waitForSelector('button[id*="btnFermer"]')
	// await popupPage.click('button[id*="btnFermer"]')

	// Close the browser
	// await browser.close()
})()
