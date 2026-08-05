import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";

const FAQ_ITEMS = [
  {
    question: "What is Mint Gate?",
    answer:
      "Mint Gate is a wallet-native membership app on Nervos CKB. Creators open paid communities; members pay a gate fee in CKB and unlock whatever the community protects — today, a private link.",
  },
  {
    question: "What do I need to get started?",
    answer:
      "A CKB-compatible wallet. Connect with CCC on CKB testnet, then create a community or browse and join one. No email account is required — your wallet is your identity for the app.",
  },
  {
    question: "How does joining a community work?",
    answer:
      "You pay the community’s mint price in CKB to the creator. After the payment is recorded, your wallet is treated as a member and you can open gated content the creator chose to protect.",
  },
  {
    question: "What is on-chain vs off-chain today?",
    answer:
      "Payments and community capacity Cells live on CKB. Search, dashboards, and gated-link delivery use the hosted app and database as an index. Membership is moving toward chain-authoritative Cells; the product already settles gate fees on-chain.",
  },
  {
    question: "Can I create my own community?",
    answer:
      "Yes. Connect your wallet, open Create Community, set a name, description, guidelines, mint price in CKB, and an optional gated link. Members who pay can access that link when they qualify.",
  },
  {
    question: "Which network is Mint Gate on?",
    answer:
      "The live MVP targets CKB testnet. Connect a testnet wallet and use testnet CKB for mint fees while you explore or pilot a community.",
  },
] as const

/** FAQ accordion for the marketing home page. */
export function HomeFaq() {
  return (
    <section className="border-t border-border px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-3 text-center text-2xl font-semibold tracking-tight">
          FAQ
        </h2>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          Straight answers about memberships, fees, and what the chain proves today.
        </p>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`}>
              <AccordionTrigger className="text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <button className="mt-10 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90" onClick={() => {
        console.log("Test Click");
        alert("Test Click");
      }}>Test Click</button>

      <Button className="mt-10 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90" onClick={() => {
        console.log("Test Click");
        alert("Test Click");
      }}>Test Click</Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="mt-6 w-full rounded-full text-sm font-medium"
          >
            Open Alert Dialog
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.<br />
              This is just a demo AlertDialog using shadcn/ui.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>




    </section>
  )
}
