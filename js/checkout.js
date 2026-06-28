window.AramazdCheckout = {
  saveDraft(draft){
    draft.created_at_local = new Date().toISOString();
    localStorage.setItem('aramazd_pending_checkout', JSON.stringify(draft));
  },

  getDraft(){
    try {
      return JSON.parse(localStorage.getItem('aramazd_pending_checkout') || 'null');
    } catch(e){
      return null;
    }
  },

  clearDraft(){
    localStorage.removeItem('aramazd_pending_checkout');
  },

  async start(draft, opts){
    this.saveDraft(draft);

    const session = await Aramazd.getSession();

    const checkoutPath = (opts && opts.checkoutPath) || '../checkout.html';
    const loginPath = (opts && opts.loginPath) || '../login.html';
    const nextForLogin = (opts && opts.next) || 'checkout.html';

    if(!session){
      alert('Պատվերը շարունակելու համար նախ գրանցվեք կամ մուտք գործեք։');
      location.href = loginPath + '?next=' + encodeURIComponent(nextForLogin);
      return;
    }

    location.href = checkoutPath;
  },

  async createOrderFromDraft(){
    const draft = this.getDraft();

    if(!draft){
      throw new Error('Պատվերի տվյալները չեն գտնվել։');
    }

    const session = await Aramazd.getSession();

    if(!session || !session.user){
      throw new Error('Մուտք գործեք պատվերը ավարտելու համար։');
    }

    const user = session.user;
    const profile = await Aramazd.ensureProfile(user);

    const price = Number(draft.price || 0);

    // Demo վճարում․ իրական վճարում դեռ չի եղել
    const deposit = Number(draft.deposit || 5000);
    const paidAmount = 0;
    const remainingAmount = price;

    const { data, error } = await aramazdClient
      .from('orders')
      .insert([{
        user_id: user.id,

        product: draft.product || 'Պատվեր',
        status: 'Նոր պատվեր',

        // Վճարումը դեռ իրականում հաստատված չէ
        payment_status: 'Չհաստատված',
        deposit_amount: deposit,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,

        customer_name:
          draft.customer_name ||
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email,

        phone:
          draft.phone ||
          profile?.phone ||
          '',

        price: price,

        details: {
          ...(draft.details || {}),
          demo_payment: true,
          payment_note: 'Demo checkout․ իրական վճարում դեռ չի կատարվել',
          customer_email: user.email
        }
      }])
      .select()
      .single();

    if(error){
      throw error;
    }

    this.clearDraft();
    return data;
  }
};
