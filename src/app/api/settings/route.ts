export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
    }

    const body = await req.json()
    const { username, email, avatar } = body

    // LinkPages koleksiyonunda güncelleme yap
    const db = await connectToDatabase()
    const linkPagesCollection = db.collection('linkPages')
    
    await linkPagesCollection.updateOne(
      { userId: session.user.id },
      { 
        $set: { 
          username,
          email,
          avatar
        } 
      }
    )

    return new Response(JSON.stringify({ 
      username, 
      email,
      avatar
    }), { status: 200 })

  } catch (error) {
    console.error('Settings update error:', error)
    return new Response(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500 }
    )
  }
} 