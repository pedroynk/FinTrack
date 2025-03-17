// function NatureManager({ natures, refreshNatures }: { natures: Nature[]; refreshNatures: () => void }) {
//   const [newNature, setNewNature] = useState("");

//   async function handleDelete(id: number) {
//     await deleteNatureApi(id);
//     refreshNatures();
//   }

//   async function handleCreate() {
//     // TODO: implement the API call to create a new nature, e.g.:
//     // await createNatureApi(newNature);
//     refreshNatures();
//     setNewNature("");
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Manage Natures</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="flex items-center space-x-2">
//           <Input
//             value={newNature}
//             onChange={(e) => setNewNature(e.target.value)}
//             placeholder="New Nature"
//           />
//           <Button onClick={handleCreate}>Create</Button>
//         </div>
//         <Table className="mt-4 overflow-auto">
//         <div className="max-h-64 overflow-y-auto">         
//           <TableHeader>
//             <TableRow>
//               <TableCell>Name</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {natures.map((nature) => (
//               <TableRow key={nature.id}>
//                 <TableCell>{nature.name}</TableCell>
//                 <TableCell>
//                   <Button
//                     variant="ghost"
//                     className="p-2 text-red-500"
//                     onClick={() => handleDelete(nature.id)}
//                   >
//                     <Trash size={16} />
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//           </div>  
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }
