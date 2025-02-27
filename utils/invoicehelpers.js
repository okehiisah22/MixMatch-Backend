function calculateDurationHours(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMillis = endDate - startDate;
  const durationHours = durationMillis / (1000 * 60 * 60);
  return durationHours;
}

const AutoInvoiceData = (formState) => {
  const hoursSpent = calculateDurationHours(
    formState.bookingData.start,
    formState.bookingData.end
  );

  const additionalEquipmentsArray =
    formState?.bookingData?.additionalEquipments?.map((a) => ({
      description: a.type,
      hours: hoursSpent,
      rate: a.rate,
    }));

  const djServiceArray = [
    {
      description: 'DJ Service',
      rate: formState.hourlyRate,
      hours: hoursSpent,
      amount: formState.hourlyRate * hoursSpent,
    },
  ];

  const mergedArray = [...additionalEquipmentsArray, ...djServiceArray];

  const newInvoicetabledata = mergedArray.map((a) => ({
    description: a.description,
    hours: a.hours,
    rate: a.rate,
    amount: a.hours * a.rate,
  }));

  const subtotal = newInvoicetabledata.reduce(
    (acc, item) => acc + item.amount,
    0
  );
  const totalGST = +(subtotal * 0.05).toFixed(1);
  const tax = +(subtotal * 0.1).toFixed(1);
  const dueAmount = +(subtotal + totalGST + tax).toFixed(1);

  return {
    newInvoicetabledata,
    totals: { subtotal, tax, totalGST, dueAmount },
  };
};

const paymentData = (autoPaymentInfo) => {
  if (autoPaymentInfo?.paymentType === 'cash') {
    return 'cash';
  } else if (autoPaymentInfo?.paymentType === 'cashapp') {
    return {
      paymentType: 'cashapp',
      cashappusername: autoPaymentInfo.paymentOption.cashappusername,
    };
  } else if (autoPaymentInfo?.paymentType === 'paypal') {
    return {
      paymentType: 'paypal',
      cashappusername: autoPaymentInfo.paymentOption.paypalusername,
    };
  } else if (autoPaymentInfo?.paymentType === 'bankTransfer') {
    return {
      paymentType: 'banktransfer',
      cashappusername: autoPaymentInfo.paymentOption.cashappusername,
    };
  } else if (autoPaymentInfo?.paymentType === 'zelle') {
    return {
      paymentType: 'zelle',
      cashappusername: autoPaymentInfo.paymentOption.cashappusername,
    };
  } else return 'wrong';
};

exports = { AutoInvoiceData, paymentData };
