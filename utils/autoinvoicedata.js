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

exports.AutoInvoiceData;
